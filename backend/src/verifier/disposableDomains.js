// disposableDomains.js
// Maintains a list of known disposable/temporary email domains
// Used to warn users about temporary email addresses that may not persist

export const disposableDomains = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  '10minutemail.com',
  'temp-mail.org',
  'yopmail.com',
  'mailnesia.com',
  'fakeinbox.com',
  'trashmail.com',
  'getnada.com',
  'maildrop.cc',
  'mail.tm',
  'dispostable.com',
  'temp-mail.io',
  'inboxalias.com',
  'fakeemail.net',
  'burnermail.io',
  'anonbox.net',
  'tempail.com',
];

/**
 * Check if a domain is a known disposable email domain
 * @param {string} domain - The email domain to check
 * @returns {boolean} - True if domain is disposable
 */
export function isDisposableDomain(domain) {
  if (!domain) return false;
  return disposableDomains.some(d => d.toLowerCase() === domain.toLowerCase());
}
