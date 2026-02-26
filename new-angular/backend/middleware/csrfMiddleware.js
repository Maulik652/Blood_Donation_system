const { verifyCsrfToken } = require('../utils/csrf');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const requireCsrf = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const csrfToken = req.headers['x-csrf-token'];

  if (!verifyCsrfToken(csrfToken, req.user)) {
    res.status(403);
    throw new Error('Invalid or missing CSRF token');
  }

  next();
};

module.exports = { requireCsrf };
