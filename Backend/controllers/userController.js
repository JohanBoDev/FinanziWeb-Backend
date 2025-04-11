const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// 📌 Obtener todos los usuarios (Solo Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Excluir contraseña
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

// 📌 Crear un usuario manualmente (Solo Admin)
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      profilePicture,
      currency,
      notificationsEnabled,
    } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture:
        profilePicture || "https://example.com/default-avatar.png",
      preferences: {
        currency: currency || "COP",
        notificationsEnabled:
          notificationsEnabled !== undefined ? notificationsEnabled : true,
      },
      role: role === "admin" ? "admin" : "user",
    });

    await user.save();
    res.status(201).json({ message: "Usuario creado correctamente", user });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error });
  }
};

// 📌 Actualizar un usuario (Solo Admin)
const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = req.body; // Contiene solo los campos enviados
  
      const updatedUser = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("❌ Error al actualizar usuario:", error);
      res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
  };
  
// 📌 Eliminar un usuario (Solo Admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};

// 📌 Obtener usuario por ID (solo Admin)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, "-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error });
  }
};

// Permitir al usuario actualizar su perfil

const updateUserProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, // ID del usuario autenticado
      { name, profilePicture },
      { new: true, select: "-password" } // Excluir contraseña del resultado
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado correctamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el perfil", error });
  }
};

// Permite actualizar preferencias de usuario
const updateUserPreferences = async (req, res) => {
  try {
    const { currency, notificationsEnabled } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, // ID del usuario autenticado
      {
        preferences: {
          currency,
          notificationsEnabled
        }
      },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Preferencias actualizadas correctamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar las preferencias", error });
  }
};

// 📌 Obtener el usuario autenticado
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario", error });
  }
};



module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  updateUserProfile,
  updateUserPreferences,
  getCurrentUser,
};
