const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const secret = process.env.JWT_SECRET;
const expiration = '2h';

function signToken(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    username: user.username
  };

  return jwt.sign({data: payload }, secret, {expiresIn: expiration});
}

function authMiddleware(req,res,next) {
  let token =req.headers.authorization;

  if (token && token.startsWith('Bearer')){
    token = token.split(' ')[1].trim();
  } else {
    return res.status(401).json({message:'authorization token invalid'});
  }

  try {
    const {data} =jwt.verify(token, secret, {maxAge: expiration});
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({message:'invalid or expired token'});
  }
}

module.exports = {signToken,authMiddleware};