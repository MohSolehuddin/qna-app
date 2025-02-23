const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "secret_key";

function generateToken(payload) {
  let expiresIn = process.env.JWT_EXPIRED_IN || "12h";
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return "expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      return "invalid";
    } else {
      return "invalid";
    }
  }
};

module.exports = { generateToken, verifyToken };
