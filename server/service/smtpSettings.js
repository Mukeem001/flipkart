const crypto = require("crypto")
const SmtpSettings = require("../models/smtpSettings")
const {
    DEFAULT_OTP_EMAIL_SUBJECT,
    DEFAULT_OTP_EMAIL_TEMPLATE
} = require("./otpEmailTemplate")

const encryptionKey = () => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is required to encrypt SMTP settings")
    }
    return crypto.createHmac("sha256", process.env.ACCESS_TOKEN_SECRET)
        .update("flipkart-smtp-settings-v1")
        .digest()
}

const encryptPassword = (password) => {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv)
    const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()])
    return `v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("hex")}`
}

const decryptPassword = (encryptedPassword) => {
    const [version, ivHex, tagHex, encryptedHex] = encryptedPassword.split(":")
    if (version !== "v1" || !ivHex || !tagHex || !encryptedHex) {
        throw new Error("Stored SMTP password has an unsupported format")
    }

    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"))
    decipher.setAuthTag(Buffer.from(tagHex, "hex"))
    return Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, "hex")),
        decipher.final()
    ]).toString("utf8")
}

const getSmtpSettings = async () => {
    const settings = await SmtpSettings.findOne({ key: "primary" })
        .select("+passwordEncrypted")
        .lean()

    if (!settings) return null

    return {
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        user: settings.user,
        password: decryptPassword(settings.passwordEncrypted),
        senderEmail: settings.senderEmail
    }
}

const getOtpEmailSettings = async () => {
    const settings = await SmtpSettings.findOne({ key: "primary" })
        .select("otpEmailSubject otpEmailTemplate")
        .lean()

    return {
        subject: settings?.otpEmailSubject || DEFAULT_OTP_EMAIL_SUBJECT,
        template: settings?.otpEmailTemplate || DEFAULT_OTP_EMAIL_TEMPLATE
    }
}

const migrateSmtpSettingsFromEnv = async () => {
    const existing = await SmtpSettings.findOne({ key: "primary" }).select("_id").lean()
    const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASS: password, SENDER_EMAIL: senderEmail } = process.env
    if (existing || !host || !user || !password || !senderEmail) return false

    const port = Number(process.env.SMTP_PORT || 587)
    if (!Number.isInteger(port) || port < 1 || port > 65535) return false

    await SmtpSettings.create({
        key: "primary",
        host,
        port,
        secure: process.env.SMTP_SECURE === "true",
        user,
        passwordEncrypted: encryptPassword(password),
        senderEmail
    })
    return true
}

module.exports = { decryptPassword, encryptPassword, getOtpEmailSettings, getSmtpSettings, migrateSmtpSettingsFromEnv }
