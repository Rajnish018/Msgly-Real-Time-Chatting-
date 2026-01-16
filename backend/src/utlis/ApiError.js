
class ApiError extends Error {
  constructor({
    statusCode = 500,
    message = "Internal Server Error",
    errors = [],
    isOperational = true,
  }) {
    super(message);

    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
