// server.js
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const usersRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");
const savingsRoutes = require("./routes/savingsRoutes");
const debtRoutes = require("./routes/debtRoutes");
const interesRoutes = require("./routes/interestRoutes");
const mortgageRoutes = require("./routes/mortgageRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const savingsGoalsRoutes = require("./routes/savingsGoalsRoutes");
const debtManagementRoutes = require("./routes/debtManagementRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const authGoogleRoutes = require("./routes/authGoogle");
const passport = require("passport");


// Cargar variables de entorno
dotenv.config();
require("./config/passport");
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

// Configurar Passport para autenticación
app.use(passport.initialize());

// Rutas principales
app.use("/api/users", usersRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/interests", interesRoutes);
app.use("/api/mortgages", mortgageRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/savingsGoals", savingsGoalsRoutes);
app.use("/api/debtManagement", debtManagementRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/auth", authGoogleRoutes);




// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡Backend de Finanzi funcionando!");
});

// Middleware para manejar errores
app.use(errorHandler);

// Configurar el puerto
const PORT = process.env.PORT || 2000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
