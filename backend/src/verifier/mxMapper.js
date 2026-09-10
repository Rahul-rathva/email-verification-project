// mxMapper.js
// Maps MX records to their respective email providers
// Helps identify which mail service a domain uses (Gmail, Outlook, etc.)
// This provides insights on the email domain's reputation and reliability

const providerMappings = {
  gmail: {
    patterns: ['aspmx.l.google.com', 'alt1.aspmx.l.google.com', 'alt2.aspmx.l.google.com', 'google.com'],
    name: 'Gmail',
    icon: '📧 Gmail'
  },
  outlook: {
    patterns: ['outlook.com', 'outlook-com.olc.protection.outlook.com', 'hotmail.com', 'microsoft.com'],
    name: 'Microsoft Outlook',
    icon: '📬 Outlook'
  },
  office365: {
    patterns: ['protection.outlook.com', 'outlook-com.olc.protection'],
    name: 'Office 365',
    icon: '📊 Office 365'
  },
  amazonses: {
    patterns: ['amazonses.com', 'mail-eopf.amazonses'],
    name: 'Amazon SES',
    icon: '☁️ Amazon SES'
  },
  sendgrid: {
    patterns: ['sendgrid.net'],
    name: 'SendGrid',
    icon: '📬 SendGrid'
  },
  mailgun: {
    patterns: ['mailgun.org'],
    name: 'Mailgun',
    icon: '📬 Mailgun'
  },
  fastmail: {
    patterns: ['fastmail.com', 'mx.fastmail.com'],
    name: 'FastMail',
    icon: '📧 FastMail'
  },
  protonmail: {
    patterns: ['protonmail.com', 'mx.protonmail.com'],
    name: 'ProtonMail',
    icon: '🔒 ProtonMail'
  },
  yahoo: {
    patterns: ['yahoo.com', 'mxcdn.yahoo.com'],
    name: 'Yahoo Mail',
    icon: '📬 Yahoo'
  },
  aol: {
    patterns: ['aol.com', 'mxa.aol.com'],
    name: 'AOL Mail',
    icon: '📬 AOL'
  }
};

/**
 * Detect which email provider a domain uses based on MX records
 * @param {string[]} mxRecords - Array of MX record hostnames
 * @returns {object} - Provider info with name and icon
 */
export function detectEmailProvider(mxRecords) {
  if (!mxRecords || !Array.isArray(mxRecords)) {
    return { name: 'Unknown Provider', icon: '📬 Unknown' };
  }

  const recordsLower = mxRecords.map(r => r.toLowerCase());

  // Check each provider
  for (const [key, provider] of Object.entries(providerMappings)) {
    const matches = provider.patterns.some(pattern =>
      recordsLower.some(record => record.includes(pattern.toLowerCase()))
    );
    if (matches) {
      return { name: provider.name, icon: provider.icon };
    }
  }

  return { name: 'Custom Email Provider', icon: '📬 Custom' };
}

/**
 * Get all MX records with provider info
 * @param {string[]} mxRecords - Array of MX record hostnames
 * @returns {object[]} - Array of records with provider detection
 */
export function mapMXRecords(mxRecords) {
  if (!mxRecords || !Array.isArray(mxRecords)) {
    return [];
  }

  return mxRecords.map(record => {
    const recordLower = record.toLowerCase();
    let provider = 'Unknown';

    // Detect provider from record
    for (const [key, prov] of Object.entries(providerMappings)) {
      if (prov.patterns.some(p => recordLower.includes(p.toLowerCase()))) {
        provider = prov.name;
        break;
      }
    }

    return {
      hostname: record,
      provider: provider
    };
  });
}
