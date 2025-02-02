const user = require('../models/userModel');
const jwt = require("jsonwebtoken");


const verificarAdmin = (req, res, next) => {
  try {
    console.log("🟢 Verificando Admin - Usuario:", req.user); // 🔹 Verificar datos del usuario autenticado

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
    }

    next();
  } catch (error) {
    console.error("❌ Error en verificarAdmin:", error);
    res.status(500).json({ message: "Error en la verificación de permisos", error: error.message });
  }
};

const verificarToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
  }

  try {
    // Extraer y verificar token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    
    console.log("🟢 Token decodificado:", decoded); // 🔹 Verifica que el token tiene `role`
    
    req.user = decoded;

    next(); // Continuar con la siguiente función
  } catch (error) {
    console.error("❌ Error en verificarToken:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

    module.exports = { verificarAdmin, verificarToken };