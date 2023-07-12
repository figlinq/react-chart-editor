/*eslint-disable */

/**
 * Capitalize string
 */
export const capitalize = (s) => (!s ? '' : s.charAt(0).toUpperCase() + s.substring(1));

/**
 * "Safer" String.toLowerCase()
 */
export const lowerCase = (str) => str.toLowerCase();

/**
 * "Safer" String.toUpperCase()
 */
export const upperCase = (str) => str.toUpperCase();

/**
 * Remove non-word chars.
 */
export const removeNonWord = (str) => str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

/**
 * Convert string to camelCase text.
 */
export const camelCase = (string) =>
  string
    .replace(/\-/g, ' ')
    .replace(/(\d)(?=(\d{1})+$)/g, '$1 ')
    .replace(/\s[a-z]/g, upperCase)
    .replace(/\s+/g, '')
    .replace(/^[A-Z]/g, lowerCase);

export const pascalCase = (str) => camelCase(str).replace(/^[a-z]/, upperCase);

/* eslint-enable */
