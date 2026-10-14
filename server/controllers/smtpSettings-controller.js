const SmtpSettings = require("../models/smtpSettings")
const { encryptPassword } = require("../service/smtpSettings")
const wrapAsync = require("../utils/wrapAsync")

const defaultSettings = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "",
    senderEmail: "",
    passwordConfigured: false
}

const publicSettings = (settings) => settings ? ({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    user: settings.user,
    senderEmail: settings.senderEmail,
    passwordConfigured: Boolean(settings.passwordEncrypted)
}) : defaultSettings

const getSmtpSettings = wrapAsync(async (req, res) => {
    const settings = await SmtpSettings.findOne({ key: "primary" })
        .select("host port secure user senderEmail +passwordEncrypted")
        .lean()
    return res.status(200).json({ settings: publicSettings(settings) })
})

const saveSmtpSettings = wrapAsync(async (req, res) => {
    const { host, port, secure, user, password, senderEmail } = req.body || {}
    const normalizedHost = typeof host === "string" ? host.trim() : ""
    const normalizedUser = typeof user === "string" ? user.trim() : ""
    const normalizedSender = typeof senderEmail === "string" ? senderEmail.trim().toLowerCase() : ""
    const parsedPort = Number(port)

    if (!normalizedHost || normalizedHost.length > 255 || !/^[a-z0-9.-]+$/i.test(normalizedHost)) {
        return res.status(400).json({ success: false, message: "Enter a valid SMTP host." })
    }
    if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
        return res.status(400).json({ success: false, message: "SMTP port must be between 1 and 65535." })
    }
    if (typeof secure !== "boolean") {
        return res.status(400).json({ success: false, message: "Choose whether SMTP uses a secure connection." })
    }
    if (!normalizedUser || normalizedUser.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedSender)) {
        return res.status(400).json({ success: false, message: "Enter a valid SMTP username and sender email." })
    }
    if (typeof password !== "undefined" && (typeof password !== "string" || password.length > 1024)) {
        return res.status(400).json({ success: false, message: "SMTP password must be a string under 1024 characters." })
    }

    const existing = await SmtpSettings.findOne({ key: "primary" }).select("+passwordEncrypted")
    const nextPassword = password ? encryptPassword(password) : existing?.passwordEncrypted
    if (!nextPassword) {
        return res.status(400).json({ success: false, message: "Enter the SMTP password to configure mail delivery." })
    }

    const settings = await SmtpSettings.findOneAndUpdate(
        { key: "primary" },
        {
            $set: {
                host: normalizedHost,
                port: parsedPort,
                secure,
                user: normalizedUser,
                passwordEncrypted: nextPassword,
                senderEmail: normalizedSender
            }
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select("host port secure user senderEmail +passwordEncrypted").lean()

    return res.status(200).json({ success: true, settings: publicSettings(settings) })
})

module.exports = { getSmtpSettings, saveSmtpSettings }
