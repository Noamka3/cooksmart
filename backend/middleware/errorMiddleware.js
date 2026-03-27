const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode =
    error.statusCode ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${error.message}`, error.stack);
  }

  res.status(statusCode).json({
    message: error.message || "Internal server error",
  });
};

module.exports = { notFound, errorHandler };
