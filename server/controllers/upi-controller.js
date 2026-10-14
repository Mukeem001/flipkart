const PaymentSettings = require("../models/paymentSettings")

const allowedProviders = new Set(["google-pay", "phonepe", "paytm", "mobikwik"])
const upiIdPattern = /^[a-z0-9][a-z0-9._-]{0,99}@[a-z0-9][a-z0-9.-]{0,29}$/i

const getUpiOptions = async (req, res) => {
    const settings = await PaymentSettings.findOne({ key: "upi" }).lean()
    const upiOptions = (settings?.upiOptions || [])
        .filter(option => option.enabled)
        .map(({ _id, provider, label, upiId }) => ({ id: _id, provider, label, upiId }))

    res.status(200).json({ upiOptions })
}

const getAdminUpiOptions = async (req, res) => {
    const settings = await PaymentSettings.findOne({ key: "upi" }).lean()
    res.status(200).json({ upiOptions: settings?.upiOptions || [] })
}

const saveUpiOptions = async (req, res) => {
    const { upiOptions } = req.body
    if (!Array.isArray(upiOptions) || upiOptions.length > 50) {
        return res.status(400).json({ success: false, message: "Provide up to 50 UPI options" })
    }

    const normalizedOptions = []
    const seen = new Set()
    for (const option of upiOptions) {
        const provider = typeof option.provider === "string" ? option.provider.trim() : ""
        const label = typeof option.label === "string" ? option.label.trim() : ""
        const upiId = typeof option.upiId === "string" ? option.upiId.trim().toLowerCase() : ""
        const identity = `${provider}:${upiId}`

        if (!allowedProviders.has(provider)) {
            return res.status(400).json({ success: false, message: "Choose Google Pay, PhonePe, Paytm, or MobiKwik" })
        }
        if (!label || label.length > 60 || !upiIdPattern.test(upiId)) {
            return res.status(400).json({ success: false, message: "Enter a valid label and UPI ID" })
        }
        if (seen.has(identity)) {
            return res.status(400).json({ success: false, message: "Duplicate UPI IDs are not allowed for the same app" })
        }

        seen.add(identity)
        normalizedOptions.push({ provider, label, upiId, enabled: option.enabled !== false })
    }

    const settings = await PaymentSettings.findOneAndUpdate(
        { key: "upi" },
        { $set: { upiOptions: normalizedOptions } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({ success: true, upiOptions: settings.upiOptions })
}

module.exports = { getUpiOptions, getAdminUpiOptions, saveUpiOptions }