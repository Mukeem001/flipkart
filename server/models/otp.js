const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    purpose: {
        type: String,
        enum: ["login", "signup"],
        default: "login"
    },
    otpHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema)