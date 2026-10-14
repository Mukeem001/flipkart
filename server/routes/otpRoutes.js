const express = require("express");
const { SendOtp, SendSignupOtp, VerifyOtp } = require("../controllers/otp-controller");
const router = express.Router()

//Send OTP
router.post("/send-otp", SendOtp);

//Send signup email verification code
router.post("/signup/send-otp", SendSignupOtp);

//Verify OTP
router.post("/verify-otp", VerifyOtp);

module.exports = router