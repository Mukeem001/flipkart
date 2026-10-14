const express = require("express")
const router = express.Router()
const adminAuth = require("../middlewares/adminAuth")
const { listUsers, loginAdmin, updateUserRole, deleteUser } = require("../controllers/admin-controller")

router.post("/admin/login", loginAdmin)
router.get("/admin/users", adminAuth, listUsers)
router.patch("/admin/users/:id/role", adminAuth, updateUserRole)
router.delete("/admin/users/:id", adminAuth, deleteUser)

module.exports = router