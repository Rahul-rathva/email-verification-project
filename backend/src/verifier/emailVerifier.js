// emailVerifier.js
// Core email verification module
// Part 1: Email Verification Function
// - Validates email syntax using regex and format checks
// - Performs DNS MX lookup to get the mail server
// - Connects to SMTP server and checks if mailbox exists using RCPT TO command
// - Returns structured result with comprehensive information
//
// Trade-offs:
// - SMTP timeout of 5 seconds balances accuracy vs. speed
// - Uses built-in DNS module (built-in, no dependencies) vs. external libraries
// - Email regex is strict to catch most format errors early

import dns from 'dns';
import net from 'net';
import { getDidYouMean } from './typoDetector.js';
import { isDisposableDomain } from './disposableDomains.js';
import { detectEmailProvider, mapMXRecords } from './mxMapper.js';

// Comprehensive email regex pattern
// Covers most standard email formats, does NOT allow all RFC compliant addresses but catches common errors
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SMTP response codes
const SMTP_CODES = {
  OK: 250,
  SERVICE_READY: 220,
  AUTH_SUCCESS: 235,
  INVALID_MAILBOX: 550,
  GREYLISTED: 450
};

/**
 * Validate email syntax
 * Checks format, length, and basic structure
 * @param {string} email - Email address to validate
 * @returns {object} - { valid: boolean, error: string | null }
 */
export function validateEmailSyntax(email) {
  // Check for null/undefined
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  // Check for string type
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  // Trim whitespace
  email = email.trim();

  // Check minimum length
  if (email.length < 3) {
    return { valid: false, error: 'Email too short' };
  }

  // Check maximum length (RFC 5321)
  if (email.length > 254) {
    return { valid: false, error: 'Email too long (max 254 characters)' };
  }

  // Check for single @ symbol
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) {
    return { valid: false, error: `Email must contain exactly one @ symbol (found ${atCount})` };
  }

  // Check basic format
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  const [localPart, domain] = email.split('@');

  // Validate local part (before @)
  if (localPart.length > 64) {
    return { valid: false, error: 'Local part too long (max 64 characters)' };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, error: 'Local part cannot start or end with a dot' };
  }

  if (localPart.includes('..')) {
    return { valid: false, error: 'Local part cannot contain consecutive dots' };
  }

  // Validate domain part
  if (domain.length < 3) {
    return { valid: false, error: 'Domain too short' };
  }

  if (!domain.includes('.')) {
    return { valid: false, error: 'Domain must contain a dot' };
  }

  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, error: 'Domain cannot start or end with a dot' };
  }

  return { valid: true, error: null };
}

/**
 * Perform DNS MX record lookup
 * Gets mail servers for the domain
 * @param {string} domain - Domain to look up
 * @returns {Promise<object>} - { mxRecords: string[], error: string | null }
 */
export async function getMXRecords(domain) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ mxRecords: [], error: 'DNS lookup timeout' });
    }, 5000);

    dns.resolveMx(domain, (err, addresses) => {
      clearTimeout(timeout);
      if (err) {
        resolve({ mxRecords: [], error: `DNS lookup failed: ${err.code}` });
      } else if (!addresses || addresses.length === 0) {
        resolve({ mxRecords: [], error: 'No MX records found' });
      } else {
        // Sort by priority and extract hostnames
        const sorted = addresses
          .sort((a, b) => a.priority - b.priority)
          .map(record => record.exchange);
        resolve({ mxRecords: sorted, error: null });
      }
    });
  });
}

/**
 * Connect to SMTP server and verify mailbox exists
 * Uses RCPT TO command to check if mailbox exists without sending email
 * @param {string} email - Email to verify
 * @param {string[]} mxRecords - MX hostnames to try
 * @returns {Promise<object>} - { valid: boolean, subresult: string, error: string | null }
 */
export async function verifyMailboxSMTP(email, mxRecords) {
  if (!mxRecords || mxRecords.length === 0) {
    return { valid: false, subresult: 'no_mx_records', error: 'No MX records available' };
  }

  // Try each MX server
  for (const mx of mxRecords) {
    const result = await checkMailboxOnServer(email, mx);
    if (result.checked) {
      return result;
    }
  }

  return { valid: false, subresult: 'all_mx_servers_failed', error: 'Could not connect to any MX server' };
}

/**
 * Try to verify mailbox on a single SMTP server
 * @param {string} email - Email to verify
 * @param {string} mxHost - MX server hostname
 * @returns {Promise<object>} - Verification result
 */
async function checkMailboxOnServer(email, mxHost) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: mxHost, port: 25 });
    let commandsSent = 0;
    let commandsCompleted = 0;
    let serverResponse = '';
    let verified = false;
    let subresult = 'connection_error';

    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ valid: false, checked: true, subresult: 'timeout', error: 'SMTP connection timeout' });
    }, 5000);

    socket.on('connect', () => {
      // Connection established
    });

    socket.on('data', (data) => {
      serverResponse = data.toString();
      const code = parseInt(serverResponse.split(' ')[0]);

      if (code === SMTP_CODES.SERVICE_READY) {
        // Server ready, send HELO
        socket.write('HELO verify\r\n');
        commandsSent++;
      } else if (code === SMTP_CODES.OK) {
        commandsCompleted++;
        
        if (commandsSent === 1 && commandsCompleted === 1) {
          // HELO accepted, send MAIL FROM
          socket.write(`MAIL FROM:<verify@verify.com>\r\n`);
          commandsSent++;
        } else if (commandsSent === 2 && commandsCompleted === 2) {
          // MAIL FROM accepted, send RCPT TO
          socket.write(`RCPT TO:<${email}>\r\n`);
          commandsSent++;
        } else if (commandsSent === 3 && commandsCompleted === 3) {
          // RCPT TO accepted, mailbox exists
          verified = true;
          subresult = 'mailbox_exists';
          socket.write('QUIT\r\n');
          socket.destroy();
          clearTimeout(timeout);
          resolve({ valid: true, checked: true, subresult, error: null });
        }
      } else if (code === SMTP_CODES.INVALID_MAILBOX) {
        // 550 = Requested action not taken: mailbox unavailable
        subresult = 'mailbox_does_not_exist';
        socket.destroy();
        clearTimeout(timeout);
        resolve({ valid: false, checked: true, subresult, error: 'Mailbox does not exist' });
      } else if (code === SMTP_CODES.GREYLISTED) {
        // 450 = Requested action not taken: try again later
        subresult = 'greylisted';
        socket.destroy();
        clearTimeout(timeout);
        resolve({ valid: false, checked: true, subresult, error: 'Server greylisted - try again later' });
      } else if (code >= 500) {
        // Server error
        subresult = `smtp_error_${code}`;
        socket.destroy();
        clearTimeout(timeout);
        resolve({ valid: false, checked: true, subresult, error: `SMTP error ${code}` });
      }
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ 
        valid: false, 
        checked: true, 
        subresult: 'connection_error', 
        error: `Connection error: ${error.code}` 
      });
    });

    socket.on('close', () => {
      clearTimeout(timeout);
      if (!verified) {
        resolve({ 
          valid: false, 
          checked: true, 
          subresult: 'connection_closed', 
          error: 'Connection closed unexpectedly' 
        });
      }
    });
  });
}

/**
 * Main email verification function
 * Part 1 of the assignment - combines syntax check, DNS lookup, and SMTP verification
 * @param {string} email - Email address to verify
 * @returns {Promise<object>} - Structured verification result
 */
export async function verifyEmail(email) {
  const startTime = Date.now();

  // Initialize result object
  const result = {
    email: email || '',
    result: 'unknown',
    resultcode: 3,
    subresult: 'unknown',
    domain: '',
    mxRecords: [],
    disposable: false,
    emailProvider: null,
    didyoumean: null,
    executiontime: 0,
    error: null,
    timestamp: new Date().toISOString()
  };

  try {
    // Step 1: Validate syntax
    const syntaxValidation = validateEmailSyntax(email);
    if (!syntaxValidation.valid) {
      result.result = 'invalid';
      result.resultcode = 6;
      result.subresult = 'invalid_format';
      result.error = syntaxValidation.error;
      
      // Check for typos
      const typoSuggestion = getDidYouMean(email);
      if (typoSuggestion) {
        result.didyoumean = typoSuggestion;
      }
      
      result.executiontime = Math.round((Date.now() - startTime) / 1000);
      return result;
    }

    // Extract domain
    const [, domain] = email.split('@');
    result.domain = domain;

    // Check if disposable domain
    result.disposable = isDisposableDomain(domain);

    // Step 2: Get MX records
    const mxResult = await getMXRecords(domain);
    if (mxResult.error) {
      result.result = 'unknown';
      result.resultcode = 3;
      result.subresult = 'dns_lookup_failed';
      result.error = mxResult.error;
      result.executiontime = Math.round((Date.now() - startTime) / 1000);
      return result;
    }

    result.mxRecords = mxResult.mxRecords;
    result.emailProvider = detectEmailProvider(mxResult.mxRecords);

    // Step 3: Verify mailbox via SMTP
    const smtpResult = await verifyMailboxSMTP(email, mxResult.mxRecords);
    if (smtpResult.valid) {
      result.result = 'valid';
      result.resultcode = 1;
      result.subresult = smtpResult.subresult;
    } else {
      if (smtpResult.subresult === 'greylisted' || 
          smtpResult.subresult === 'timeout' ||
          smtpResult.subresult === 'connection_error') {
        result.result = 'unknown';
        result.resultcode = 3;
      } else {
        result.result = 'invalid';
        result.resultcode = 6;
      }
      result.subresult = smtpResult.subresult;
      result.error = smtpResult.error;
    }

    // Check for typos (in case user wants suggestions)
    const typoSuggestion = getDidYouMean(email);
    if (typoSuggestion) {
      result.didyoumean = typoSuggestion;
    }

    result.executiontime = Math.round((Date.now() - startTime) / 1000);
    return result;

  } catch (error) {
    result.result = 'unknown';
    result.resultcode = 3;
    result.subresult = 'unexpected_error';
    result.error = error.message;
    result.executiontime = Math.round((Date.now() - startTime) / 1000);
    return result;
  }
}

/**
 * Helper to perform a DNS MX lookup for a domain.
 * Returns an array of MX hostnames sorted by priority.
 */
async function getMxRecords(domain) {
  try {
    const records = await dns.resolveMx(domain);
    // Sort by priority (lowest first)
    records.sort((a, b) => a.priority - b.priority);
    return records.map(r => r.exchange);
  } catch (err) {
    // If DNS fails, return empty array and propagate error via caller
    return [];
  }
}

/**
 * Helper to perform SMTP RCPT TO verification.
 * Connects to the first MX host on port 25, sends EHLO, MAIL FROM, RCPT TO.
 * Resolves with an object containing subresult and resultcode.
 * Implements a 5‑second timeout to avoid hanging connections.
 */
function smtpVerify(mxHost, email) {
  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      socket.destroy();
      resolve({
        subresult: 'connection_timeout',
        resultcode: 3, // unknown
        result: 'unknown',
        error: 'SMTP connection timed out',
      });
    }, 5000);

    let step = 0;
    const commands = [
      `EHLO ${email.split('@')[1]}\r\n`,
      `MAIL FROM:<verify@${email.split('@')[1]}>\r\n`,
      `RCPT TO:<${email}>\r\n`,
    ];

    socket.on('data', (data) => {
      if (timedOut) return;
      const response = data.toString();
      // console.log('SMTP response:', response);
      if (step < commands.length) {
        socket.write(commands[step]);
        step++;
      } else {
        // After RCPT TO, interpret response codes
        clearTimeout(timeout);
        // 250 indicates mailbox exists
        // 550 indicates mailbox does not exist
        // 450/451/452 indicates temporary failure (greylisted)
        const code = parseInt(response.slice(0, 3), 10);
        if (code === 250) {
          resolve({
            subresult: 'mailbox_exists',
            resultcode: 1,
            result: 'valid',
            error: null,
          });
        } else if (code === 550) {
          resolve({
            subresult: 'mailbox_does_not_exist',
            resultcode: 6,
            result: 'invalid',
            error: null,
          });
        } else if ([450, 451, 452].includes(code)) {
          resolve({
            subresult: 'greylisted',
            resultcode: 3,
            result: 'unknown',
            error: null,
          });
        } else {
          resolve({
            subresult: 'connection_error',
            resultcode: 3,
            result: 'unknown',
            error: `Unexpected SMTP code ${code}`,
          });
        }
        socket.end();
      }
    });

    socket.on('error', (err) => {
      if (timedOut) return;
      clearTimeout(timeout);
      resolve({
        subresult: 'connection_error',
        resultcode: 3,
        result: 'unknown',
        error: err.message,
      });
    });
  });
}

/**
 * Main verification function.
 * @param {string} email The email address to verify.
 * @returns {Promise<Object>} Structured result with fields as per spec.
 */
async function verifyEmail(email) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Basic null/undefined handling
  if (!email || typeof email !== 'string') {
    return {
      email: email || null,
      result: 'invalid',
      resultcode: 6,
      subresult: 'invalid_input',
      domain: null,
      mxRecords: [],
      executiontime: (Date.now() - startTime) / 1000,
      error: 'Email is null, undefined, or not a string',
      timestamp,
    };
  }

  // Trim whitespace
  const trimmed = email.trim();

  // Syntax validation using validator.js
  if (!validator.isEmail(trimmed)) {
    return {
      email: trimmed,
      result: 'invalid',
      resultcode: 6,
      subresult: 'invalid_syntax',
      domain: null,
      mxRecords: [],
      executiontime: (Date.now() - startTime) / 1000,
      error: 'Invalid email format',
      timestamp,
    };
  }

  const domain = trimmed.split('@')[1];

  // Check disposable domain (optional feature)
  const isDisposable = disposableDomains.includes(domain.toLowerCase());

  // Perform MX lookup
  const mxRecords = await getMxRecords(domain);

  // If no MX records, we cannot verify further
  if (mxRecords.length === 0) {
    return {
      email: trimmed,
      result: 'unknown',
      resultcode: 3,
      subresult: 'no_mx_records',
      domain,
      mxRecords: [],
      executiontime: (Date.now() - startTime) / 1000,
      error: 'No MX records found for domain',
      timestamp,
    };
  }

  // Attempt SMTP verification using the first MX host
  const smtpResult = await smtpVerify(mxRecords[0], trimmed);

  // Did you mean detection (typo)
  const suggestion = getDidYouMean(trimmed);
  const didyoumean = suggestion ? suggestion : null;

  const result = {
    email: trimmed,
    result: smtpResult.result,
    resultcode: smtpResult.resultcode,
    subresult: smtpResult.subresult,
    domain,
    mxRecords,
    executiontime: (Date.now() - startTime) / 1000,
    error: smtpResult.error,
    timestamp,
    // Optional extra fields for UI
    didyoumean,
    disposable: isDisposable,
    provider: mapMxToProvider(mxRecords),
  };

  return result;
}

module.exports = { verifyEmail };
