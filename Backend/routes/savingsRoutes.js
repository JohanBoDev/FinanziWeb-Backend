const express = require("express");
const router = express.Router();
const {
  createSavings,
  getAllSavings,
  getSavingsById,
  updateSavings,
  deleteSavings,
} = require("../controllers/savingsController");
const { verificarToken, verificarTokenOpcional } = require("../middleware/auth");

// 📌 Crear un nuevo cálculo de ahorros
// Ruta: POST /api/savings/createSavings
// Descripción: Recibe datos del usuario y calcula el ahorro con interés compuesto, luego lo guarda en la base de datos.
router.post("/createSavings", verificarTokenOpcional, createSavings);

// 📌 Obtener todos los cálculos de ahorros de un usuario
// Ruta: GET /api/savings/getAllSavings
// Descripción: Retorna todos los cálculos de ahorros que ha guardado el usuario autenticado.
router.get("/getAllSavings", verificarToken, getAllSavings);

// 📌 Obtener un cálculo de ahorros por ID
// Ruta: GET /api/savings/getSavingsById/:id
// Descripción: Busca en la base de datos un cálculo específico de ahorros según su ID.
router.get("/getSavingsById/:id", verificarToken, getSavingsById);

// 📌 Actualizar un cálculo de ahorros existente
// Ruta: PUT /api/savings/updateSavings/:id
// Descripción: Permite modificar un cálculo de ahorros ya guardado por el usuario.
router.put("/updateSavings/:id", verificarToken, updateSavings);

// 📌 Eliminar un cálculo de ahorros
// Ruta: DELETE /api/savings/deleteSavings/:id
// Descripción: Borra un cálculo de ahorros de la base de datos según su ID.
router.delete("/deleteSavings/:id", verificarToken, deleteSavings);

module.exports = router;
