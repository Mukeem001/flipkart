const mongoose = require("mongoose")

const smtpSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: "primary"
    },
    host: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    port: {
        type: Number,
        required: true,
        min: 1,
        max: 65535
    },
    secure: {
        type: Boolean,
        default: false
    },
    user: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    passwordEncrypted: {
        type: String,
        required: true,
        select: false
    },
    senderEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 254
    },
    otpEmailSubject: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "Your Flip verification code"
    },
    otpEmailTemplate: {
        type: String,
        maxlength: 5000,
        default: "Hi,\n\nWe received a request to verify your Flip account.\n\nYour verification code is {{otp}}.\nIt expires in 10 minutes and can only be used once.\n\nIf you did not request this code, you can ignore this email. For your security, do not share this code with anyone.\n\nThanks,\nFlip Support"
    }
}, { timestamps: true })

module.exports = mongoose.model("SmtpSettings", smtpSettingsSchema)
