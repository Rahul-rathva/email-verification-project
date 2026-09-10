// typoDetector.js
// Implements "Did You Mean?" functionality using Levenshtein distance algorithm
// Detects common typos in email domains and suggests corrections
// Algorithm: Edit Distance - minimum number of single-character edits (insertions, deletions, substitutions)

const commonDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'protonmail.com',
  'aol.com',
  'mail.com',
  'icloud.com',
  'zoho.com',
  'yandex.com',
  'fastmail.com',
  'tutanota.com',
  'mailbox.org',
  'riseup.net'
];

/**
 * Calculate Levenshtein distance between two strings
 * Uses dynamic programming approach for efficiency
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Minimum edit distance
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create matrix to store distances
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill matrix with distance calculations
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = 1 + Math.min(
          matrix[i - 1][j],     // deletion
          matrix[i][j - 1],     // insertion
          matrix[i - 1][j - 1]  // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Find typo suggestions for an email domain
 * Uses Levenshtein distance with threshold of 2 edits maximum
 * @param {string} email - The email address to check
 * @returns {object} - Suggestion with score and corrected email, or null
 */
export function getDidYouMean(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return null;
  }

  const [localPart, domain] = parts;
  
  // Find the closest matching domain with distance <= 2
  let bestMatch = null;
  let bestDistance = 3; // Threshold: only suggest if distance is 2 or less

  for (const commonDomain of commonDomains) {
    const distance = levenshteinDistance(domain.toLowerCase(), commonDomain.toLowerCase());
    
    if (distance < bestDistance && distance > 0) {
      bestDistance = distance;
      bestMatch = {
        original: email,
        suggested: `${localPart}@${commonDomain}`,
        domain: commonDomain,
        distance: distance,
        confidence: ((3 - distance) / 3) * 100 // Higher confidence for smaller distances
      };
    }
  }

  return bestMatch;
}

/**
 * Get multiple potential suggestions for an email
 * @param {string} email - The email address to check
 * @param {number} limit - Maximum number of suggestions to return (default: 3)
 * @returns {object[]} - Array of suggestions ordered by confidence
 */
export function getMultipleSuggestions(email, limit = 3) {
  if (!email || typeof email !== 'string') {
    return [];
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return [];
  }

  const [localPart, domain] = parts;
  
  // Calculate distance for all domains and collect matches
  const matches = [];

  for (const commonDomain of commonDomains) {
    const distance = levenshteinDistance(domain.toLowerCase(), commonDomain.toLowerCase());
    
    if (distance <= 2 && distance > 0) {
      matches.push({
        original: email,
        suggested: `${localPart}@${commonDomain}`,
        domain: commonDomain,
        distance: distance,
        confidence: ((3 - distance) / 3) * 100
      });
    }
  }

  // Sort by distance (ascending) then by confidence (descending)
  matches.sort((a, b) => a.distance - b.distance || b.confidence - a.confidence);

  return matches.slice(0, limit);
}
