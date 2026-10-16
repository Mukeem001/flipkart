const CorsSettings = require("../models/corsSettings")
const {
    getConfiguredCorsOrigins,
    updateConfiguredCorsOrigins
} = require("../service/corsSettings")
const wrapAsync = require("../utils/wrapAsync")

const normalizeOrigin = (value) => {
    if (typeof value !== "string" || !value.trim()) return null

    const input = value.trim()
    if (input.length > 300 || input.includes("*")) return null
    const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`

    try {
        const url = new URL(withProtocol)
        if (!["http:", "https:"].includes(url.protocol) ||
            url.username || url.password ||
            (url.pathname !== "/" && url.pathname !== "") ||
            url.search || url.hash) {
            return null
        }
        return url.origin
    } catch {
        return null
    }
}

const getCorsSettings = wrapAsync(async (req, res) => {
    return res.status(200).json({ origins: getConfiguredCorsOrigins() })
})

const saveCorsSettings = wrapAsync(async (req, res) => {
    const { origins } = req.body || {}
    if (!Array.isArray(origins) || origins.length > 100) {
        return res.status(400).json({ success: false, message: "Provide up to 100 allowed domains." })
    }

    const normalizedOrigins = []
    const seen = new Set()
    for (const input of origins) {
        const origin = normalizeOrigin(input)
        if (!origin) {
            return res.status(400).json({
                success: false,
                message: `Enter a valid domain origin without a path: ${String(input)}`
            })
        }
        if (seen.has(origin)) {
            return res.status(400).json({
                success: false,
                message: `Duplicate domain is not allowed: ${origin}`
            })
        }
        seen.add(origin)
        normalizedOrigins.push(origin)
    }

    const settings = await CorsSettings.findOneAndUpdate(
        { key: "allowed-origins" },
        { $set: { origins: normalizedOrigins } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean()

    updateConfiguredCorsOrigins(settings.origins)
    return res.status(200).json({ success: true, origins: settings.origins })
})

module.exports = { getCorsSettings, normalizeOrigin, saveCorsSettings }
