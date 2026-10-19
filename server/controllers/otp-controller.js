const { sendMailWithSmtpSettings } = require("../config/nodeMailer");
const Otp = require("../models/otp");
const crypto = require("crypto");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const wrapAsync = require("../utils/wrapAsync");
const { getOtpEmailSettings } = require("../service/smtpSettings");
const { renderOtpEmail, renderOtpEmailText } = require("../service/otpEmailTemplate");
const { hashOtp, isOtpValid } = require("../service/otpVerification");

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const sendOtpEmail = async ({ to, otp }) => {
    const { subject, template } = await getOtpEmailSettings()
    return sendMailWithSmtpSettings({
        to,
        subject,
        html: renderOtpEmail(template, otp),
        text: renderOtpEmailText(template, otp)
    })
}

const createAndSendSignupOtp = async (email) => {
    await Otp.deleteMany({ email, purpose: "signup" });
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpRecord = await Otp.create({
        email,
        purpose: "signup",
        otpHash: hashOtp(otp),
        expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    try {
        await sendOtpEmail({ to: email, otp });
    } catch (error) {
        await Otp.deleteOne({ _id: otpRecord._id });
        throw error;
    }
}

module.exports.SendSignupOtp = wrapAsync(async (req, res) => {
    const { email, username, phone } = req.body;
    if (!email || !username || !phone) {
        return res.status(400).json({ success: false, message: "Email, username, and phone are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: username.trim() }, { phone }]
    });
    if (existingUser) {
        return res.status(409).json({ success: false, message: "Email, username, or phone is already registered" });
    }

    try {
        await createAndSendSignupOtp(normalizedEmail);
    } catch (error) {
        console.error("Signup OTP Delivery Error:", error.message);
        const status = error.code === "SMTP_NOT_CONFIGURED" || error.code === "EMAIL_SENDER_NOT_CONFIGURED" ? 503 : 502;
        return res.status(status).json({ success: false, message: error.message || "Failed to send signup verification email" });
    }

    return res.status(200).json({ success: true, message: "Signup verification code sent" });
});

//Send OTP
module.exports.SendOtp = wrapAsync(async (req, res) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ success: false, message: "Email or phone number is required" });
    }

    let existingUser;
    if (email) {
        const normalizedEmail = email.toLowerCase().trim();
        existingUser = await User.findOne({ email: normalizedEmail });
        if (!existingUser) {
            try {
                await createAndSendSignupOtp(normalizedEmail);
            } catch (error) {
                console.error("Signup OTP Delivery Error:", error.message);
                const status = error.code === "SMTP_NOT_CONFIGURED" || error.code === "EMAIL_SENDER_NOT_CONFIGURED" ? 503 : 502;
                return res.status(status).json({ success: false, message: error.message || "Failed to send signup verification email" });
            }
            return res.status(200).json({
                success: true,
                message: "Signup verification code sent",
                purpose: "signup"
            });
        }
    } else {
        const digits = String(phone).replace(/\D/g, '');
        const localNumber = digits.length > 10 ? digits.slice(-10) : digits;
        if (localNumber.length !== 10) {
            return res.status(400).json({ success: false, message: "Enter a valid 10-digit phone number" });
        }
        existingUser = await User.findOne({ phone: { $in: [localNumber, `+91${localNumber}`, `91${localNumber}`] } });
    }

    if (!existingUser) {
        return res.status(404).json({ success: false, message: "User does not exist. Please sign up first." });
    }

    await Otp.deleteMany({ userId: existingUser._id });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(otp);

    await Otp.create({
        userId: existingUser._id,
        otpHash,
        expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    try {
        await sendOtpEmail({ to: existingUser.email, otp });
    } catch (err) {
        await Otp.deleteMany({ userId: existingUser._id });
        console.error("OTP Delivery Error:", err.message);
        const status = err.code === "SMTP_NOT_CONFIGURED" || err.code === "EMAIL_SENDER_NOT_CONFIGURED" ? 503 : 502;
        return res.status(status).json({ success: false, message: err.message || "Failed to send OTP email." });
    }

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
});


//Verify OTP
module.exports.VerifyOtp = wrapAsync(async (req, res) => {
    const { email, phone, otp } = req.body

    if ((!email && !phone) || !otp) {
        return res.status(400).json({ success: false, message: "Email or phone number and OTP are required" });
    }

    let existingUser;
    if (email) {
        const normalizedEmail = email.toLowerCase().trim();
        existingUser = await User.findOne({ email: normalizedEmail });
    } else {
        const digits = String(phone).replace(/\D/g, '');
        const localNumber = digits.length > 10 ? digits.slice(-10) : digits;
        if (localNumber.length !== 10) {
            return res.status(400).json({ success: false, message: "Enter a valid 10-digit phone number" });
        }
        existingUser = await User.findOne({ phone: { $in: [localNumber, `+91${localNumber}`, `91${localNumber}`] } });
    }

    if (!existingUser) {
        if (email) {
            const normalizedEmail = email.toLowerCase().trim()
            const signupOtp = await Otp.findOne({
                email: normalizedEmail,
                purpose: "signup",
                expiresAt: { $gt: Date.now() }
            })
            if (!signupOtp) {
                return res.status(400).json({ success: false, message: "Signup OTP expired or not found. Request a new code." })
            }
            if (!isOtpValid(otp, signupOtp.otpHash)) {
                return res.status(400).json({ success: false, message: "Incorrect signup OTP" })
            }
            return res.status(200).json({
                success: true,
                signupRequired: true,
                message: "Email verified. Complete your account details."
            })
        }
        return res.status(404).json({ success: false, message: "User does not exist" })
    }

    const otpRecord = await Otp.findOne({
        userId: existingUser._id,
        expiresAt: { $gt: Date.now() }
    })

    if (!otpRecord) {
        return res.status(400).json({ success: false, message: "OTP expired or invalid" })
    }

    if (!isOtpValid(otp, otpRecord.otpHash)) {
        return res.status(400).json({ success: false, message: "Incorrect Otp" })
    }

    await Otp.deleteMany({ userId: existingUser._id })

    const accessToken = jwt.sign({ _id: existingUser._id, role: existingUser.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20m" })
    const refreshToken = jwt.sign({ _id: existingUser._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
        success: true, message: "Login Successfull", token: accessToken, resUser: {
            _id: existingUser._id,
            email: existingUser.email,
            name: existingUser.name,
            username: existingUser.username,
            phone: existingUser.phone,
            addresses: existingUser.addresses,
            selectedAddressId: existingUser.selectedAddressId
        }
    })
})