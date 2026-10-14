const crypto = require("node:crypto")

const adminApiKey = (req, res, next) => {
    const expectedKey = process.env.ADMIN_API_KEY
    if (!expectedKey) {
        return res.status(503).json({ success: false, message: "Admin API key is not configured on the server" })
    }

    const providedKey = req.get("x-admin-key") || ""
    const expectedBuffer = Buffer.from(expectedKey)
    const providedBuffer = Buffer.from(providedKey)
    if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
        return res.status(401).json({ success: false, message: "Invalid admin key" })
    }

    next()
}

module.exports = adminApiKey