const SmtpSettings = require("../models/smtpSettings")
const { encryptPassword } = require("../service/smtpSettings")
const {
    DEFAULT_OTP_EMAIL_SUBJECT,
    DEFAULT_OTP_EMAIL_TEMPLATE
} = require("../service/otpEmailTemplate")
const { sendEmailDeliveryTest } = require("../config/nodeMailer")
const wrapAsync = require("../utils/wrapAsync")

const defaultSettings = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "",
    senderEmail: "",
    otpEmailSubject: DEFAULT_OTP_EMAIL_SUBJECT,
    otpEmailTemplate: DEFAULT_OTP_EMAIL_TEMPLATE,
    passwordConfigured: false
}

const publicSettings = (settings) => settings ? ({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    user: settings.user,
    senderEmail: settings.senderEmail,
    otpEmailSubject: settings.otpEmailSubject || DEFAULT_OTP_EMAIL_SUBJECT,
    otpEmailTemplate: settings.otpEmailTemplate || DEFAULT_OTP_EMAIL_TEMPLATE,
    passwordConfigured: Boolean(settings.passwordEncrypted)
}) : defaultSettings

const getSmtpSettings = wrapAsync(async (req, res) => {
    const settings = await SmtpSettings.findOne({ key: "primary" })
        .select("host port secure user senderEmail otpEmailSubject otpEmailTemplate +passwordEncrypted")
        .lean()
    return res.status(200).json({ settings: publicSettings(settings) })
})

const saveSmtpSettings = wrapAsync(async (req, res) => {
    const { host, port, secure, user, password, senderEmail, otpEmailSubject, otpEmailTemplate } = req.body || {}
    const normalizedHost = typeof host === "string" ? host.trim() : ""
    const normalizedUser = typeof user === "string" ? user.trim() : ""
    const normalizedSender = typeof senderEmail === "string" ? senderEmail.trim().toLowerCase() : ""
    const normalizedSubject = typeof otpEmailSubject === "string" ? otpEmailSubject.trim() : ""
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
    const nextOtpSubject = typeof otpEmailSubject === "undefined"
        ? existing?.otpEmailSubject || DEFAULT_OTP_EMAIL_SUBJECT
        : normalizedSubject
    const nextOtpTemplate = typeof otpEmailTemplate === "undefined"
        ? existing?.otpEmailTemplate || DEFAULT_OTP_EMAIL_TEMPLATE
        : otpEmailTemplate

    if (!nextOtpSubject || nextOtpSubject.length > 200 || /[\r\n]/.test(nextOtpSubject)) {
        return res.status(400).json({ success: false, message: "Enter an OTP email subject under 200 characters." })
    }
    if (typeof nextOtpTemplate !== "string" || !nextOtpTemplate.trim() ||
        nextOtpTemplate.length > 5000 || !nextOtpTemplate.includes("{{otp}}")) {
        return res.status(400).json({ success: false, message: "OTP email content must be under 5000 characters and include {{otp}}." })
    }

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
                senderEmail: normalizedSender,
                otpEmailSubject: nextOtpSubject,
                otpEmailTemplate: nextOtpTemplate
            }
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select("host port secure user senderEmail otpEmailSubject otpEmailTemplate +passwordEncrypted").lean()

    return res.status(200).json({ success: true, settings: publicSettings(settings) })
})

const sendTestEmail = wrapAsync(async (req, res) => {
    const { email } = req.body || {}
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ success: false, message: "Enter a valid test recipient email address." })
    }

    try {
        await sendEmailDeliveryTest({ to: normalizedEmail })
    } catch (error) {
        console.error("Email Delivery Test Error:", error.message)
        const status = error.code === "SMTP_NOT_CONFIGURED" ? 503 : 502
        return res.status(status).json({ success: false, message: error.message || "Could not send the test email." })
    }

    return res.status(200).json({ success: true, message: `Test email sent to ${normalizedEmail}.` })
})

module.exports = { getSmtpSettings, saveSmtpSettings, sendTestEmail }
