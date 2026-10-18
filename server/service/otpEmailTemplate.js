const DEFAULT_OTP_EMAIL_SUBJECT = "Your Flip verification code"
const DEFAULT_OTP_EMAIL_TEMPLATE = "Hi,\n\nWe received a request to verify your Flip account.\n\nYour verification code is {{otp}}.\nIt expires in 10 minutes and can only be used once.\n\nIf you did not request this code, you can ignore this email. For your security, do not share this code with anyone.\n\nThanks,\nFlip Support"
const PREVIOUS_DEFAULT_OTP_EMAIL_SUBJECT = "Flipkart - Verification Code"
const PREVIOUS_DEFAULT_OTP_EMAIL_TEMPLATE = "Your verification code is {{otp}}.\nIt is valid for 5 minutes."

const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const renderOtpEmail = (template, otp) => escapeHtml(template.replaceAll("{{otp}}", String(otp)))
    .replace(/\r\n|\r|\n/g, "<br>")

const renderOtpEmailText = (template, otp) => template.replaceAll("{{otp}}", String(otp))

const resolveOtpEmailSettings = (subject, template) => {
    if (subject === PREVIOUS_DEFAULT_OTP_EMAIL_SUBJECT && template === PREVIOUS_DEFAULT_OTP_EMAIL_TEMPLATE) {
        return { subject: DEFAULT_OTP_EMAIL_SUBJECT, template: DEFAULT_OTP_EMAIL_TEMPLATE }
    }
    return {
        subject: subject || DEFAULT_OTP_EMAIL_SUBJECT,
        template: template || DEFAULT_OTP_EMAIL_TEMPLATE
    }
}

module.exports = {
    DEFAULT_OTP_EMAIL_SUBJECT,
    DEFAULT_OTP_EMAIL_TEMPLATE,
    renderOtpEmail,
    renderOtpEmailText,
    resolveOtpEmailSettings
}
