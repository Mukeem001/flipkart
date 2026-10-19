const crypto = require("crypto")

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex")

const isOtpValid = (otp, storedHash) => {
    const suppliedHash = Buffer.from(hashOtp(otp), "hex")
    const expectedHash = Buffer.from(storedHash || "", "hex")
    return suppliedHash.length === expectedHash.length &&
        crypto.timingSafeEqual(suppliedHash, expectedHash)
}

module.exports = { hashOtp, isOtpValid }
