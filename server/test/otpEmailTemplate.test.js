const test = require("node:test")
const assert = require("node:assert/strict")
const {
    DEFAULT_OTP_EMAIL_SUBJECT,
    DEFAULT_OTP_EMAIL_TEMPLATE,
    renderOtpEmail
} = require("../service/otpEmailTemplate")

test("default OTP template includes the code and expiry duration", () => {
    assert.equal(DEFAULT_OTP_EMAIL_SUBJECT, "Flipkart - Verification Code")
    assert.match(renderOtpEmail(DEFAULT_OTP_EMAIL_TEMPLATE, "123456"), /123456/)
    assert.match(renderOtpEmail(DEFAULT_OTP_EMAIL_TEMPLATE, "123456"), /5 minutes/)
})

test("OTP renderer substitutes every token and escapes content for HTML", () => {
    assert.equal(
        renderOtpEmail("Code {{otp}} and again {{otp}} <script>\nDone & safe", "654321"),
        "Code 654321 and again 654321 &lt;script&gt;<br>Done &amp; safe"
    )
})
