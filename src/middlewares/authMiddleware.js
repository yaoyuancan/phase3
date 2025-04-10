const jwt = require('jsonwebtoken');

// a simple role check middleware
const checkRole = (requiredRole) => {
  return (req, res, next) => {
  // get user role from request headers
  // const token = req.cookies.token;
  const token = req.signedCookies.token;
  if (!token) {
      return res.status(401).json({ status: 'error', message: 'Access Denied. No Token Provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).send('Token 无效或已过期！');
      if (user.role !== requiredRole) {
        return res.status(401).json({ status: 'error', message: "Access Denied. No permissions" });
      }
      res.user = user;
      next();
  });
  }
}

module.exports = {
  checkRole
}
