// emailVerifier.test.js
// Comprehensive test suite for email verification functionality
// Part 3 of assignment: minimum 15 test cases
// Tests all edge cases and error scenarios

import { 
  validateEmailSyntax, 
  getMXRecords, 
  verifyEmail
} from '../src/verifier/emailVerifier.js';
import { getDidYouMean } from '../src/verifier/typoDetector.js';
import { isDisposableDomain } from '../src/verifier/disposableDomains.js';

// Test 1: Valid email format
describe('Email Format Validation', () => {
  test('should accept valid email format', () => {
    const result = validateEmailSyntax('user@example.com');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  // Test 2: Reject missing @ symbol
  test('should reject email without @ symbol', () => {
    const result = validateEmailSyntax('userexample.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must contain exactly one @');
  });

  // Test 3: Reject double @
  test('should reject email with multiple @ symbols', () => {
    const result = validateEmailSyntax('user@@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('@');
  });

  // Test 4: Reject double dots
  test('should reject email with consecutive dots', () => {
    const result = validateEmailSyntax('user..name@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('consecutive dots');
  });

  // Test 5: Reject email starting with dot
  test('should reject local part starting with dot', () => {
    const result = validateEmailSyntax('.user@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('start or end with a dot');
  });

  // Test 6: Reject email ending with dot
  test('should reject local part ending with dot', () => {
    const result = validateEmailSyntax('user.@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('start or end with a dot');
  });

  // Test 7: Reject empty string
  test('should reject empty string', () => {
    const result = validateEmailSyntax('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  // Test 8: Reject null/undefined
  test('should reject null email', () => {
    const result = validateEmailSyntax(null);
    expect(result.valid).toBe(false);
  });

  test('should reject undefined email', () => {
    const result = validateEmailSyntax(undefined);
    expect(result.valid).toBe(false);
  });

  // Test 9: Reject very long email (max 254 chars)
  test('should reject email exceeding 254 characters', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    const result = validateEmailSyntax(longEmail);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });

  // Test 10: Reject very short email
  test('should reject email too short', () => {
    const result = validateEmailSyntax('a@b');
    expect(result.valid).toBe(false);
  });

  // Test 11: Reject domain without dot
  test('should reject domain without dot', () => {
    const result = validateEmailSyntax('user@localhost');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('dot');
  });

  // Test 12: Reject non-string input
  test('should reject non-string input', () => {
    const result = validateEmailSyntax(12345);
    expect(result.valid).toBe(false);
  });
});

// Typo Detection Tests
describe('Typo Detection (Did You Mean?)', () => {
  test('should detect gmial.com typo and suggest gmail.com', () => {
    const result = getDidYouMean('user@gmial.com');
    expect(result).not.toBeNull();
    expect(result.suggested).toBe('user@gmail.com');
    expect(result.distance).toBeLessThanOrEqual(2);
  });

  test('should detect yahooo.com typo and suggest yahoo.com', () => {
    const result = getDidYouMean('user@yahooo.com');
    expect(result).not.toBeNull();
    expect(result.suggested).toContain('yahoo.com');
  });

  test('should not suggest correction for valid email', () => {
    const result = getDidYouMean('user@gmail.com');
    expect(result).toBeNull();
  });

  test('should not suggest correction for very different domain', () => {
    const result = getDidYouMean('user@xyz123abc.com');
    expect(result).toBeNull();
  });
});

// Disposable Domain Detection
describe('Disposable Domain Detection', () => {
  test('should identify mailinator.com as disposable', () => {
    const result = isDisposableDomain('mailinator.com');
    expect(result).toBe(true);
  });

  test('should identify tempmail.com as disposable', () => {
    const result = isDisposableDomain('tempmail.com');
    expect(result).toBe(true);
  });

  test('should not identify gmail.com as disposable', () => {
    const result = isDisposableDomain('gmail.com');
    expect(result).toBe(false);
  });

  test('should be case-insensitive', () => {
    const result = isDisposableDomain('MAILINATOR.COM');
    expect(result).toBe(true);
  });
});

// Response Format Validation
describe('Response Format', () => {
  test('should return structured result with required fields for invalid format', () => {
    const result = validateEmailSyntax('test@example.com');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('error');
  });

  test('should reject email with spaces', () => {
    const result = validateEmailSyntax('user @example.com');
    expect(result.valid).toBe(false);
  });

  test('should trim whitespace from email', () => {
    const result = validateEmailSyntax('  user@example.com  ');
    expect(result.valid).toBe(true);
  });

  test('should handle local part with valid special characters', () => {
    const result = validateEmailSyntax('user+tag@example.com');
    expect(result.valid).toBe(true);
  });

  test('should reject local part exceeding 64 characters', () => {
    const longLocal = 'a'.repeat(65) + '@example.com';
    const result = validateEmailSyntax(longLocal);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Local part too long');
  });
});

describe('Edge Cases', () => {
  test('should handle domain with hyphen', () => {
    const result = validateEmailSyntax('user@my-domain.com');
    expect(result.valid).toBe(true);
  });

  test('should handle subdomain', () => {
    const result = validateEmailSyntax('user@mail.example.com');
    expect(result.valid).toBe(true);
  });

  test('should handle multiple subdomains', () => {
    const result = validateEmailSyntax('user@mail.internal.example.com');
    expect(result.valid).toBe(true);
  });

  test('should reject email with only @ symbol', () => {
    const result = validateEmailSyntax('@');
    expect(result.valid).toBe(false);
  });

  test('should reject email starting with @', () => {
    const result = validateEmailSyntax('@example.com');
    expect(result.valid).toBe(false);
  });

  test('should reject email ending with @', () => {
    const result = validateEmailSyntax('user@');
    expect(result.valid).toBe(false);
  });
});

export {};

describe('verifyEmail', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('valid email - positive case', async () => {
    // Mock DNS to return MX records
    dns.resolveMx.mockResolvedValue([
      { priority: 10, exchange: 'mx1.example.com' },
      { priority: 20, exchange: 'mx2.example.com' }
    ]);
    
    // Mock SMTP connection to return 250 (mailbox exists)
    mockSMTPConnection(250);

    const result = await verifyEmail('test@example.com');
    expect(result.email).toBe('test@example.com');
    expect(result.result).toBe('valid');
    expect(result.resultcode).toBe(1);
    expect(result.subresult).toBe('mailbox_exists');
    expect(result.domain).toBe('example.com');
    expect(result.mxRecords).toEqual(['mx1.example.com', 'mx2.example.com']);
    expect(result.didyoumean).toBeNull();
    expect(result.disposable).toBe(false);
    expect(result.provider).toBe('Unknown provider');
  });

  test('invalid email - syntax error', async () => {
    const result = await verifyEmail('invalid-email');
    expect(result.result).toBe('invalid');
    expect(result.resultcode).toBe(6);
    expect(result.subresult).toBe('invalid_syntax');
    expect(result.error).toBe('Invalid email format');
  });

  test('null input', async () => {
    const result = await verifyEmail(null);
    expect(result.result).toBe('invalid');
    expect(result.resultcode).toBe(6);
    expect(result.subresult).toBe('invalid_input');
    expect(result.error).toBe('Email is null, undefined, or not a string');
  });

  test('empty string', async () => {
    const result = await verifyEmail('');
    expect(result.result).toBe('invalid');
    expect(result.resultcode).toBe(6);
    expect(result.subresult).toBe('invalid_syntax');
    expect(result.error).toBe('Invalid email format');
  });

  test('very long email', async () => {
    const longEmail = 'a'.repeat(100) + '@example.com';
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.example.com' }]);
    mockSMTPConnection(250);
    const result = await verifyEmail(longEmail);
    expect(result.result).toBe('valid');
  });

  test('multiple @ symbols', async () => {
    const result = await verifyEmail('test@@example.com');
    expect(result.result).toBe('invalid');
    expect(result.resultcode).toBe(6);
    expect(result.subresult).toBe('invalid_syntax');
  });

  test('no MX records', async () => {
    dns.resolveMx.mockResolvedValue([]);
    const result = await verifyEmail('test@nonexistentdomain12345.com');
    expect(result.result).toBe('unknown');
    expect(result.resultcode).toBe(3);
    expect(result.subresult).toBe('no_mx_records');
    expect(result.error).toBe('No MX records found for domain');
  });

  test('SMTP 550 - mailbox does not exist', async () => {
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.example.com' }]);
    mockSMTPConnection(550);
    const result = await verifyEmail('test@example.com');
    expect(result.result).toBe('invalid');
    expect(result.resultcode).toBe(6);
    expect(result.subresult).toBe('mailbox_does_not_exist');
  });

  test('SMTP 450 - greylisted', async () => {
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.example.com' }]);
    mockSMTPConnection(450);
    const result = await verifyEmail('test@example.com');
    expect(result.result).toBe('unknown');
    expect(result.resultcode).toBe(3);
    expect(result.subresult).toBe('greylisted');
  });

  test('SMTP connection error', async () => {
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.example.com' }]);
    mockSMTPConnectionError();
    const result = await verifyEmail('test@example.com');
    expect(result.result).toBe('unknown');
    expect(result.resultcode).toBe(3);
    expect(result.subresult).toBe('connection_error');
    expect(result.error).toBeTruthy();
  });

  test('SMTP timeout', async () => {
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.example.com' }]);
    mockSMTPTimeout();
    const result = await verifyEmail('test@example.com');
    expect(result.result).toBe('unknown');
    expect(result.resultcode).toBe(3);
    expect(result.subresult).toBe('connection_timeout');
    expect(result.error).toBe('SMTP connection timed out');
  });

  test('did-you-mean detection (gmial.com)', async () => {
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.gmail.com' }]);
    mockSMTPConnection(250);
    const result = await verifyEmail('user@gmial.com');
    expect(result.didyoumean).toBe('user@gmail.com');
  });

  test('did-you-mean detection with Levenshtein', async () => {
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.yahoo.com' }]);
    mockSMTPConnection(250);
    const result = await verifyEmail('user@yahooo.com');
    expect(result.didyoumean).toBe('user@yahoo.com');
  });

  test('disposable domain flag', async () => {
    dns.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mailinator.com' }]);
    mockSMTPConnection(250);
    const result = await verifyEmail('test@mailinator.com');
    expect(result.disposable).toBe(true);
  });
});

// Helper to mock SMTP connection for a given code
function mockSMTPConnection(code) {
  const mockSocket = {
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn(),
  };
  // Simulate server response after commands
  mockSocket.on.mockImplementation((event, callback) => {
    if (event === 'data') {
      // Simulate responses after each command sequence
      setTimeout(() => {
        callback(Buffer.from(code.toString() + ' OK\r\n'));
      }, 10);
    }
  });
  net.createConnection.mockReturnValue(mockSocket);
}

function mockSMTPConnectionError() {
  const mockSocket = {
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn(),
  };
  mockSocket.on.mockImplementation((event, callback) => {
    if (event === 'error') {
      callback(new Error('Connection refused'));
    }
  });
  net.createConnection.mockReturnValue(mockSocket);
}

function mockSMTPTimeout() {
  const mockSocket = {
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn(),
  };
  // Don't trigger data event, causing timeout
  net.createConnection.mockReturnValue(mockSocket);
}
