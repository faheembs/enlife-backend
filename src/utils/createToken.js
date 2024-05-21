const jwt = require("jsonwebtoken");

const expiryHandler = (date) => {
  let d = new Date(date);
  return d.getTime() / 1000;
};

const createToken = (id) => {
  let date = new Date();
  return {
    token: jwt.sign(
      {
        id,
        exp: Math.floor(expiryHandler(date.setMonth(date.getMonth() + 1))),
      },
      process.env.JWT_SECRET
    ),
    exp: date,
  };
};

module.exports = createToken;
