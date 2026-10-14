const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Otp = require("../models/otp");
const wrapAsync = require("../utils/wrapAsync");
const { verifyFirebaseIdToken } = require("../service/firebaseAdmin");

//Helper Functions
const createAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20m" }
    );
};

const createRefreshToken = (user) => {
    return jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};


//Get Me Controller
module.exports.getMe = wrapAsync(async (req, res) => {
    let userId = req.user?._id

    if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                userId = decoded._id;
            } catch (tokenErr) {
                userId = null;
            }
        }
    }

    if (!userId) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                userId = decoded._id;
            } catch (refreshErr) {
                userId = null;
            }
        }
    }

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated", success: false })
    }

    const user = await User.findById(userId)

    if (!user) {
        return res.status(404).json({ message: "User not found", success: false })
    }

    res.status(200).json({
        resUser: {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username
        }
    })
})

//Signup Controller
module.exports.signup = wrapAsync(async (req, res) => {
    const { name, email, username, password, phone, otp } = req.body
    if (!name || !email || !username || !password || !phone || !otp) {
        return res.status(400).json({ message: "All fields and email OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose: "signup",
        expiresAt: { $gt: Date.now() }
    });
    if (!otpRecord) {
        return res.status(400).json({ message: "Signup OTP expired or not found. Request a new code." });
    }

    const suppliedOtpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
    const storedHash = Buffer.from(otpRecord.otpHash, "hex");
    const suppliedHash = Buffer.from(suppliedOtpHash, "hex");
    if (storedHash.length !== suppliedHash.length || !crypto.timingSafeEqual(storedHash, suppliedHash)) {
        return res.status(400).json({ message: "Incorrect signup OTP" });
    }

    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username: username.trim() }, { phone }] });
    if (existingUser) {
        return res.status(409).json({ message: "Email, username, or phone is already registered" })
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = new User({
        name: name,
        email: normalizedEmail,
        username: username.trim(),
        password: hashedPass,
        phone: phone
    })

    const savedUser = await user.save();
    await Otp.deleteMany({ email: normalizedEmail, purpose: "signup" });

    const accessToken = createAccessToken(savedUser);
    const refreshToken = createRefreshToken(savedUser);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const resUser = {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        username: savedUser.username,
    }

    res.status(201).json({
        success: true,
        message: `${name} Welcome to FlipKart`,
        resUser,
        token: accessToken
    })
})

//Login Controller
module.exports.login = wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return res.status(401).json({
            message: "Invalid email or password",
            success: false
        })
    }

    const verifyPass = await bcrypt.compare(password, existingUser.password)
    if (!verifyPass) {
        return res.status(401).json({
            message: "Invalid email or password",
            success: false
        })
    }

    const resUser = {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
    }

    const accessToken = createAccessToken(existingUser);
    const refreshToken = createRefreshToken(existingUser);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        message: `Welcome Back ${existingUser.name}`,
        success: true,
        resUser,
        token: accessToken
    })
})

module.exports.firebasePhoneLogin = wrapAsync(async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ success: false, message: "Firebase ID token is required" });
    }

    let firebaseUser;
    try {
        firebaseUser = await verifyFirebaseIdToken(idToken);
    } catch (error) {
        return res.status(401).json({ success: false, message: "Firebase phone verification failed" });
    }

    if (!firebaseUser.phone_number) {
        return res.status(401).json({ success: false, message: "Verified phone number is missing" });
    }

    const digits = firebaseUser.phone_number.replace(/\D/g, "");
    const localNumber = digits.length > 10 ? digits.slice(-10) : digits;
    const user = await User.findOne({ phone: { $in: [localNumber, `+91${localNumber}`, `91${localNumber}`] } });

    if (!user || user.role === "admin") {
        return res.status(404).json({ success: false, message: "No customer account found for this phone number. Please sign up or use password login." });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        success: true,
        token: accessToken,
        resUser: {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username
        }
    });
});

//LogOut Route
module.exports.logOutUser = (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ message: "Logged Out Successfully" })
}

//Refresh Token Route
module.exports.refreshToken = wrapAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" })
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decoded._id)
    if (!user) {
        return res.status(401).json({ message: "User not found" })
    }

    const newAccessToken = createAccessToken(user)

    res.status(200).json({
        token: newAccessToken
    })
}) 