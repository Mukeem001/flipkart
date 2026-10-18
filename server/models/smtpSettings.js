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
        default: "Flipkart - Verification Code"
    },
    otpEmailTemplate: {
        type: String,
        maxlength: 5000,
        default: "Your verification code is {{otp}}.\nIt is valid for 5 minutes."
    }
}, { timestamps: true })

module.exports = mongoose.model("SmtpSettings", smtpSettingsSchema)
