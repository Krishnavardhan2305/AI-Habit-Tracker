export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route Not Found: ${req.originalUrl}` });
}

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
}