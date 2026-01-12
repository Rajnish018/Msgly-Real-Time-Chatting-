import ApiError from "../utlis/ApiError.js";

const errorHandler = (err, req, res, next) => {

  /* eslint-disable no-console */

  let error = err;

  if (!(error instanceof ApiError)) {
    error = new ApiError({
      statusCode: 500,
      message: "Something went wrong",
      isOperational: false,
    });
  }

 /* Prepare response */
 
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    timestamp: error.timestamp,
  };

  /* Show stack trace ONLY in development */

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
