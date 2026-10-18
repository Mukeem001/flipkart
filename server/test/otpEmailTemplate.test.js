const test = require("node:test")
const assert = require("node:assert/strict")
const {
    DEFAULT_OTP_EMAIL_SUBJECT,
    DEFAULT_OTP_EMAIL_TEMPLATE,
    renderOtpEmail,
    renderOtpEmailText,
    resolveOtpEmailSettings
} = require("../service/otpEmailTemplate")

test("default OTP template includes the code and expiry duration", () => {
    assert.equal(DEFAULT_OTP_EMAIL_SUBJECT, "Your Flip verification code")
    assert.match(renderOtpEmail(DEFAULT_OTP_EMAIL_TEMPLATE, "123456"), /123456/)
    assert.match(renderOtpEmail(DEFAULT_OTP_EMAIL_TEMPLATE, "123456"), /10 minutes/)
})

test("OTP renderer substitutes every token and escapes content for HTML", () => {
    assert.equal(
        renderOtpEmail("Code {{otp}} and again {{otp}} <script>\nDone & safe", "654321"),
        "Code 654321 and again 654321 &lt;script&gt;<br>Done &amp; safe"
    )
})

test("OTP renderer provides a plain-text version", () => {
    assert.match(renderOtpEmailText(DEFAULT_OTP_EMAIL_TEMPLATE, "123456"), /Your verification code is 123456/)
    assert.doesNotMatch(renderOtpEmailText(DEFAULT_OTP_EMAIL_TEMPLATE, "123456"), /{{otp}}/)
})

test("previous built-in defaults resolve to the current OTP email without replacing custom settings", () => {
    assert.deepEqual(
        resolveOtpEmailSettings(
            "Flipkart - Verification Code",
            "Your verification code is {{otp}}.\nIt is valid for 5 minutes."
        ),
        { subject: DEFAULT_OTP_EMAIL_SUBJECT, template: DEFAULT_OTP_EMAIL_TEMPLATE }
    )
    assert.deepEqual(
        resolveOtpEmailSettings("Custom subject", "Custom {{otp}} content"),
        { subject: "Custom subject", template: "Custom {{otp}} content" }
    )
})
