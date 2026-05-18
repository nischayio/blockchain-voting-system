const errorMiddleware = (
  err,
  req,
  res,
  next
) => {

  console.error("GLOBAL ERROR:", err);

  // mongoose invalid object id
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID",
    });
  }

  // mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
    });
  }

  // validate errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // default
  return res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.message || "Internal server error",
  });
};

export default errorMiddleware;