// server.js
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const usersRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler"); 
const savingsRoutes = require("./routes/savingsRoutes");
const debtRoutes = require("./routes/debtRoutes");
const interesRoutes = require("./routes/interestRoutes");
const mortgageRoutes = require("./routes/mortgageRoutes");



// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();

// Middlewares
app.use(cors()); // Permitir solicitudes desde el frontend
app.use(helmet()); // Mejorar la seguridad
app.use(morgan("dev")); // Logs de las solicitudes HTTP
app.use(express.json()); // Parsear el cuerpo de las solicitudes en formato JSON

//Conectar con mongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("¡API funcionando con MongoDB!");
  });
  

// Rutas principales
app.use("/api/users", usersRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/interests", interesRoutes);
app.use("/api/mortgages", mortgageRoutes);


// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡Backend de Finanzi funcionando!");
});

// Middleware para manejar errores 
app.use(errorHandler);

// Configurar el puerto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});