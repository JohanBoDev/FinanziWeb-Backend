const express = require("express");
const router = express.Router();
const {
  createSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
  deleteSavingsGoal,
} = require("../controllers/savingGoalsController");
const { verificarToken } = require("../middleware/auth");

// 📌 Crear una nueva meta de ahorro
router.post("/createSavingsGoal", verificarToken, createSavingsGoal);

// 📌 Obtener todas las metas de ahorro de un usuario
router.get("/getSavingsGoals", verificarToken, getSavingsGoals);

// 📌 Actualizar una meta de ahorro existente
router.put("/updateSavingsGoal/:goalId", verificarToken, updateSavingsGoal);

// 📌 Eliminar una meta de ahorro
router.delete("/deleteSavingsGoal/:goalId", verificarToken, deleteSavingsGoal);

module.exports = router;