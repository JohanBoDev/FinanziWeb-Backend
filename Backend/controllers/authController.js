const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// 📌 REGISTRO DE USUARIO
const register = async (req, res) => {
    try {
      const { name, email, password, profilePicture, currency, notificationsEnabled, role } = req.body;
  
      // Verificar si el usuario ya existe
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
  
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crear nuevo usuario
      const user = new User({
        name,
        email,
        password: hashedPassword,
        profilePicture: profilePicture || "https://example.com/default-avatar.png",
        preferences: {
          currency: currency || "COP",
          notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true
        },
        role: role === "admin" ? "admin" : "user" // Solo permitir "admin" si se especifica
      });
  
      await user.save();
      res.status(201).json({ message: "Usuario registrado correctamente", user });
    } catch (error) {
      res.status(500).json({ message: "Error en el servidor", error });
    }
  };
  

// 📌 LOGIN DE USUARIO
const login = async (req, res) => {
    try {
      const { email, password } = req.body;
    
      // Verificar si el usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        console.log("❌ Usuario no encontrado:", email);
        return res.status(400).json({ message: "Usuario no encontrado" });
      }
  
      // Comparar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Contraseña incorrecta");
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }
  
      // Generar token JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || "1h" }
      );
  
      //Login exitoso
      res.json({
        message: "Login exitoso",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          preferences: user.preferences,
          role: user.role
        }
      });
  
    } catch (error) {
      console.error("❌ Error en el login:", error);
      res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
  };
  

module.exports = { register, login };
