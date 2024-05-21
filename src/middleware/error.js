const httpStatus = require("http-status");
const ApiError = require("../utils/ErrorHandler");
const config = require("../config/envVar");
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }
  res.locals.errorMessage = err.message;
  const response = {
    status: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };
  if (config.env === "development") {
    console.error({
      config: config.env,
    });
    return res.status(statusCode).send(response);
  }
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
