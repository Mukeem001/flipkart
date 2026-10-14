const express = require("express")
const router = express.Router()
const adminAuth = require("../middlewares/adminAuth")
const { getUpiOptions, getAdminUpiOptions, saveUpiOptions } = require("../controllers/upi-controller")

router.get("/payment-methods/upi", getUpiOptions)
router.get("/admin/payment-methods/upi", adminAuth, getAdminUpiOptions)
router.put("/admin/payment-methods/upi", adminAuth, saveUpiOptions)

module.exports = router