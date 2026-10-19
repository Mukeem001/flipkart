const test = require("node:test")
const assert = require("node:assert/strict")
const { hashOtp, isOtpValid } = require("../service/otpVerification")

test("OTP hashes validate correct codes and reject incorrect codes", () => {
    const storedHash = hashOtp("123456")

    assert.equal(isOtpValid("123456", storedHash), true)
    assert.equal(isOtpValid("654321", storedHash), false)
})

test("OTP validation rejects missing and malformed stored hashes", () => {
    assert.equal(isOtpValid("123456", ""), false)
    assert.equal(isOtpValid("123456", "not-a-hash"), false)
})
