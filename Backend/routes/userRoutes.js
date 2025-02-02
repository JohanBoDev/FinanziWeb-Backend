const express = require("express");
const { verificarToken, verificarAdmin } = require("../middleware/auth");
const { register, login } = require("../controllers/authController");
const { getAllUsers, createUser, updateUser, deleteUser, getUserById } = require("../controllers/userController");

const router = express.Router();

// Ruta para registrar usuario
router.post("/register", register);

// Ruta para login de usuario
router.post("/login", login);

// 🔹 CRUD de Usuarios (Solo Admins)
router.post("/createUser", verificarToken, verificarAdmin, createUser);
router.get("/getAllUsers", verificarToken, verificarAdmin, getAllUsers);
router.put("/updateUser/:id", verificarToken, verificarAdmin, updateUser);
router.delete("/deleteUser/:id", verificarToken, verificarAdmin, deleteUser);
router.get("/getUserById/:id", verificarToken, verificarAdmin, getUserById);

module.exports = router;
