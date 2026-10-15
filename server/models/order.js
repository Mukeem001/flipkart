const mongoose = require("mongoose")

const deliveryAddressSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    alternatePhone: String,
    flat: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    type: String
}, { _id: false })

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    user: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        mobile: { type: String, required: true },
        address: { type: deliveryAddressSchema }
    },

    items: [{
        productImg: { type: String, required: true },
        productName: { type: String, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true , min:1 },
        price: { type: Number, required: true }
    }],

    totalPrice: Number,

    paymentDetails: {
        paymentId: {
            type: String,
            default: ""
        },
        status: { type: String, default: "PENDING" },
        method: { type: String, default: "" }
    },

    upiPaymentRequest: {
        provider: { type: String, default: "" },
        label: { type: String, default: "" },
        upiId: { type: String, default: "" },
        status: { type: String, default: "" },
        requestedAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
        placedAt: { type: Date, default: null }
    },

    status: {
        type: String,
        default: "PENDING"
    },

}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema);