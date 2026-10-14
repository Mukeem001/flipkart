const mongoose = require("mongoose")

const upiOptionSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ["google-pay", "phonepe", "paytm", "mobikwik"],
        required: true
    },
    label: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60
    },
    upiId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 120
    },
    enabled: {
        type: Boolean,
        default: true
    }
}, { _id: true })

const paymentSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: "upi"
    },
    upiOptions: {
        type: [upiOptionSchema],
        default: []
    }
}, { timestamps: true })

module.exports = mongoose.model("PaymentSettings", paymentSettingsSchema)