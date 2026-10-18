const DEFAULT_OTP_EMAIL_SUBJECT = "Flipkart - Verification Code"
const DEFAULT_OTP_EMAIL_TEMPLATE = "Your verification code is {{otp}}.\nIt is valid for 5 minutes."

const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const renderOtpEmail = (template, otp) => escapeHtml(template.replaceAll("{{otp}}", String(otp)))
    .replace(/\r\n|\r|\n/g, "<br>")

module.exports = {
    DEFAULT_OTP_EMAIL_SUBJECT,
    DEFAULT_OTP_EMAIL_TEMPLATE,
    renderOtpEmail
}
