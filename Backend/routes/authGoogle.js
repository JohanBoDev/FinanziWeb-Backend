const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Redirige al usuario a Google para iniciar sesión
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

// Google redirige aquí después del login
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // 🔐 Genero un token JWT para usar en el frontend
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h" // El token expira en 1 hora,
    });
    console.log("🟢 Token generado:", token);

    // Redirijo al frontend con el token como parámetro en la URL
    res.redirect(`https://finanzi-liart.vercel.app/google-login-success#token=${token}`);
  }
);

module.exports = router;
