const express = require("express");
const router = express.Router();
const { verificarToken, verificarTokenOpcional } = require("../middleware/auth");
const debtController = require("../controllers/debtController");

// 📌 Crear un nuevo cálculo de deuda
router.post("/createDebt", verificarTokenOpcional, debtController.createDebt);

// 📌 Obtener todos los cálculos de deuda del usuario autenticado
router.get("/getAllDebts", verificarToken, debtController.getAllDebts);

// 📌 Obtener un cálculo de deuda por ID
router.get("/getDebtById/:id", verificarToken, debtController.getDebtById);

// 📌 Actualizar un cálculo de deuda
router.put("/updateDebt/:id", verificarToken, debtController.updateDebt);

// 📌 Eliminar un cálculo de deuda
router.delete("/deleteDebt/:id", verificarToken, debtController.deleteDebt);

module.exports = router;
