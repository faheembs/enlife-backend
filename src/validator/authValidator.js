const Joi = require("joi");

const register = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string().required().description("Password is required"),
  }),
};

const socialLogin = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email().required(),
    accessToken: Joi.string(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const updatePassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string(),
    newPassword: Joi.string(),
    newEmail: Joi.string(),
  }),
};

module.exports = {
  register,
  login,
  socialLogin,
  updatePassword
};
