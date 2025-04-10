const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model')
// a simple role check middleware
const authenticateToken = (req, res, next) => {
  // get user role from request headers
  // const token = req.cookies.token;
  const token = req.signedCookies.token || req.cookies.token;
  console.log('authenticateToken token',token)
  if (!token) {
    return res.redirect('/login')
      // return res.status(401).json({ status: 'error', message: 'Access Denied. No Token Provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) return res.status(403).send('Token 无效或已过期！');
      const findUser = await userModel.findOne({username: user.username})
      if (!findUser) {
        res.status(404).json({status:'error',message: 'cannot find the user'})
      }
      res.user = findUser;
      next();
  });
}

module.exports = authenticateToken
