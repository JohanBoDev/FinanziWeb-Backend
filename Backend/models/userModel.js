const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type :String, require:true, unique: true },
        password: { type: String, required: true },
        profilePicture: { type: String, default: "https://example.com/default-avatar.png" }, 
        role: { type: String, enum: ["user", "admin"], default: "user" },
        preferences: {
          currency: { type: String, default: "COP" },
          notificationsEnabled: { type: Boolean, default: true }
        },
        createdAt: { type: Date, default: Date.now } 
    }
);

module.exports = mongoose.model("user", userSchema )