class ApiError extends Error {
  constructor(statusCode, message, isOperational = false, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      console.log("[this]", this);
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
module.exports = ApiError;
