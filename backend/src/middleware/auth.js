const jwt = require('jsonwebtoken');

/**
 * JWT auth middleware.
 * Expects: Authorization: Bearer <token>
 * Sets req.user = { id, username }
 */
module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token — unauthorized' });

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ message: msg });
  }
};
