const express = require('express');
const router = express.Router();
const { createInterestCalculation, getUserInterestCalculations, getInterestCalculationById, deleteInterestCalculation  } = require('../controllers/interestController');
const { verificarToken, verificarTokenOpcional } = require("../middleware/auth");

// 📌 Crear un nuevo cálculo de interés
// Ruta: POST /api/interests/
// Acceso: Usuario autenticado
// Descripción: Calcula el interés (simple o compuesto) y guarda el resultado en la base de datos.
router.post("/", verificarTokenOpcional, createInterestCalculation);

// 📌 Obtener todos los cálculos de interés de un usuario
// Ruta: GET /api/interests/
// Acceso: Usuario autenticado
// Descripción: Recupera todos los cálculos de interés asociados al usuario autenticado.
router.get("/getInterest", verificarToken, getUserInterestCalculations);

// 📌 Obtener un cálculo de interés específico por ID
// Ruta: GET /api/interests/:id
// Acceso: Usuario autenticado
// Descripción: Obtiene un único cálculo de interés basado en el ID proporcionado.
router.get("/getInterestById/:id", verificarToken, getInterestCalculationById);

// 📌 Eliminar un cálculo de interés
// Ruta: DELETE /api/interests/:id
// Acceso: Usuario autenticado
// Descripción: Permite eliminar un cálculo de interés específico de la base de datos.
router.delete("/:id", verificarToken, deleteInterestCalculation);

module.exports = router;