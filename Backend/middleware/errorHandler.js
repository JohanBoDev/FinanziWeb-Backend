const winston = require("winston");

// Configurar Winston para registrar errores
const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Mostrar errores en consola
    new winston.transports.File({ filename: "error.log" }) // Guardar errores en un archivo
  ]
});

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack });

  res.status(err.status || 500).json({
    message: "Error en el servidor",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : "🥞"
  });
};

module.exports = errorHandler;
