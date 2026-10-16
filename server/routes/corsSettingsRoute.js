const express = require("express")
const adminAuth = require("../middlewares/adminAuth")
const { getCorsSettings, saveCorsSettings } = require("../controllers/corsSettings-controller")

const router = express.Router()

router.get("/admin/settings/cors", adminAuth, getCorsSettings)
router.put("/admin/settings/cors", adminAuth, saveCorsSettings)

module.exports = router
