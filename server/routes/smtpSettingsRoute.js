const express = require("express")
const adminAuth = require("../middlewares/adminAuth")
const { getSmtpSettings, saveSmtpSettings, sendTestEmail } = require("../controllers/smtpSettings-controller")

const router = express.Router()

router.get("/admin/settings/smtp", adminAuth, getSmtpSettings)
router.put("/admin/settings/smtp", adminAuth, saveSmtpSettings)
router.post("/admin/settings/smtp/test", adminAuth, sendTestEmail)

module.exports = router
