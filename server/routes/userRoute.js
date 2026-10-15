const express = require("express")
const router = express.Router();
const { signup, login, getMe, refreshToken, logOutUser, firebasePhoneLogin, addAddress, selectAddress } = require("../controllers/user-controller");
const auth = require("../middlewares/auth");

//Get Me Route
router.get("/me", getMe)

// Delivery addresses
router.post("/addresses", auth, addAddress)
router.patch("/addresses/:addressId/select", auth, selectAddress)

// SignUp Route
router.post("/signup", signup)

// Login Route
router.post("/login", login)

// Firebase phone OTP login
router.post("/firebase-login", firebasePhoneLogin)

//LogOut Route
router.post("/logout", logOutUser)

//Refresh Token
router.post("/refresh", refreshToken)

module.exports = router