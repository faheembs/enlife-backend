const Joi = require("joi");
const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ErrorHandler");

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);
  if (error) {
    console.log("[exist error]");
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    res.status(httpStatus.BAD_REQUEST).json({
      message: errorMessage.split(","),
    });
    return next(errorMessage);
    // return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};
module.exports = validate;
