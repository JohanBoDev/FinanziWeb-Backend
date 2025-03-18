const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "https://example.com/default-avatar.png" },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true }, // 🔹 Indexado
    preferences: {
      currency: { type: String, default: "COP" },
      notificationsEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true } // 🔹 Agrega `createdAt` y `updatedAt`
);


module.exports = mongoose.model("User", userSchema);
