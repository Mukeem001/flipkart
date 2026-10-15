const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["customer", "seller", "admin"],
        default: "customer"
    },
    addresses: [{
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        alternatePhone: { type: String, trim: true, default: "" },
        flat: { type: String, required: true, trim: true },
        area: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        type: { type: String, enum: ["Home", "Work"], default: "Home" }
    }],
    selectedAddressId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }
    ]
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)