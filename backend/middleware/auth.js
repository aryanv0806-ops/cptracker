const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Expecting Bearer format: "Bearer <token>"
  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_coding_platform_tracker_token_secret_key_987654321');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
