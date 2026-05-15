export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  const status = error.statusCode || 500;
  res.status(status).json({
    message: error.message || "Internal server error"
  });
}
