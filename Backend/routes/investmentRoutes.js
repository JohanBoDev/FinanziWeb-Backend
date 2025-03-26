const express = require("express");
const router = express.Router();
const investmentController = require("../controllers/investmentController");
const { verificarToken, verificarTokenOpcional } = require("../middleware/auth");

// 📌 Rutas CRUD para Cálculos de Inversión
router.post("/", verificarTokenOpcional, investmentController.createInvestment);  // Crear un cálculo de inversión
router.get("/", verificarToken, investmentController.getInvestments);     // Obtener todos los cálculos del usuario
router.get("/:id", verificarToken, investmentController.getInvestmentById); // Obtener un cálculo por ID
router.put("/:id", verificarToken, investmentController.updateInvestment); // Actualizar un cálculo
router.delete("/:id", verificarToken, investmentController.deleteInvestment); // Eliminar un cálculo

module.exports = router;
