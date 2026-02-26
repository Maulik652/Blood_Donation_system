const validator = require('validator');

const sanitizeText = (value, options = {}) => {
  if (typeof value !== 'string') return '';

  let cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '');
  cleaned = validator.stripLow(cleaned, true);
  cleaned = cleaned.trim();
  cleaned = validator.escape(cleaned);

  if (options.maxLength && cleaned.length > options.maxLength) {
    cleaned = cleaned.slice(0, options.maxLength);
  }

  return cleaned;
};

const normalizeEmail = (value) => {
  if (typeof value !== 'string') return '';
  const normalized = validator.normalizeEmail(value.trim(), {
    gmail_remove_dots: false,
  });
  return normalized || '';
};

const isNonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

const isInEnum = (value, allowed) => Array.isArray(allowed) && allowed.includes(value);

const isStrongPassword = (value) =>
  typeof value === 'string' && value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

module.exports = {
  sanitizeText,
  normalizeEmail,
  isNonEmpty,
  isInEnum,
  isStrongPassword,
};