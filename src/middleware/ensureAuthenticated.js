const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ErrorHandler");
const httpStatus = require("http-status");
function ensureAuthenticated(req, res, next) {
  let token = "";
  if (req.headers["x-access-token"] || req.headers["authorization"]) {
    token = req.headers["x-access-token"] || req.headers["authorization"];
  }
  //OAuth 2.0 framework 'bearer' token type
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        let err = new ApiError(httpStatus.UNAUTHORIZED, "Auth token is invalid.");
        return next(err);
      } else {
        req.user = decoded;
        //bind on request
        next();
      }
    });
  } else {
    let err = new ApiError(httpStatus.UNAUTHORIZED, "Please provide auth token.");
    return next(err);
  }
}

module.exports = ensureAuthenticated;
