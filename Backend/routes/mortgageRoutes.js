const express = require("express");
const router = express.Router();
const { 
    createMortgageCalculation, 
    getUserMortgageCalculations, 
    getMortgageCalculationById, 
    deleteMortgageCalculation 
} = require("../controllers/mortgageController");
const { verificarToken } = require("../middleware/auth");

// 📌 Crear un cálculo de hipoteca
router.post("/", verificarToken, createMortgageCalculation);

// 📌 Obtener todos los cálculos de hipoteca del usuario autenticado
router.get("/", verificarToken, getUserMortgageCalculations);

// 📌 Obtener un cálculo de hipoteca por ID
router.get("/:id", verificarToken, getMortgageCalculationById);

// 📌 Eliminar un cálculo de hipoteca
router.delete("/:id", verificarToken, deleteMortgageCalculation);

module.exports = router;
