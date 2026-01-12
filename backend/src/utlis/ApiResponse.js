
class ApiResponse {
  constructor({ statusCode = 200, message = "Success", data = null }) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export const sendSuccess = (
  res,
  { statusCode = 200, message = "Success", data = null }) => {
  return res.status(statusCode).json(
    new ApiResponse({ statusCode, message, data })
  );
};

export default ApiResponse;
