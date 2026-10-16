const mongoose = require("mongoose")

const corsSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: "allowed-origins"
    },
    origins: {
        type: [String],
        default: []
    }
}, { timestamps: true })

module.exports = mongoose.model("CorsSettings", corsSettingsSchema)
