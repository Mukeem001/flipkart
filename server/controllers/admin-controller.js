const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const Order = require("../models/order")
const wrapAsync = require("../utils/wrapAsync")

const createAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20m" }
    )
}

const loginAdmin = wrapAsync(async (req, res) => {
    const { email, password } = req.body || {}

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid admin email or password." })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
        return res.status(401).json({ success: false, message: "Invalid admin email or password." })
    }

    if (user.role !== "admin") {
        return res.status(403).json({ success: false, message: "This account does not have admin access." })
    }

    const token = createAccessToken(user)

    return res.status(200).json({
        success: true,
        message: "Admin login successful.",
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        }
    })
})

const updateUserRole = wrapAsync(async (req, res) => {
    const { id } = req.params
    const { role } = req.body || {}

    if (!id) {
        return res.status(400).json({ success: false, message: "User id is required." })
    }

    if (!role || !["customer", "seller"].includes(role)) {
        return res.status(400).json({ success: false, message: "Role must be either customer or seller." })
    }

    const user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." })
    }

    if (user.role === "admin") {
        return res.status(403).json({ success: false, message: "Admin accounts cannot be modified from this screen." })
    }

    if (req.user?._id?.toString() === user._id.toString()) {
        return res.status(403).json({ success: false, message: "You cannot change your own role." })
    }

    user.role = role
    await user.save()

    return res.status(200).json({
        success: true,
        message: "User role updated.",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })
})

const deleteUser = wrapAsync(async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ success: false, message: "User id is required." })
    }

    const user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." })
    }

    if (user.role === "admin") {
        return res.status(403).json({ success: false, message: "Admin accounts cannot be deleted." })
    }

    if (req.user?._id?.toString() === user._id.toString()) {
        return res.status(403).json({ success: false, message: "You cannot delete your own account." })
    }

    await User.findByIdAndDelete(id)

    return res.status(200).json({
        success: true,
        message: "User deleted successfully."
    })
})

const listUsers = wrapAsync(async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100)
    const search = typeof req.query.search === "string" ? req.query.search.trim() : ""
    const filter = {}

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const searchRegex = new RegExp(escapedSearch, "i")
        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { username: searchRegex },
            { phone: searchRegex },
            { role: searchRegex }
        ]
    }

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select("name email username phone role createdAt")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        User.countDocuments(filter)
    ])

    const orderCounts = await Order.aggregate([
        { $match: { userId: { $in: users.map(user => user._id) } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } }
    ])
    const orderCountByUser = new Map(orderCounts.map(entry => [entry._id.toString(), entry.count]))
    const usersWithOrderCounts = users.map(user => ({
        ...user,
        orderCount: orderCountByUser.get(user._id.toString()) || 0
    }))

    res.status(200).json({
        users: usersWithOrderCounts,
        totalUsers,
        page,
        limit,
        totalPages: Math.max(Math.ceil(totalUsers / limit), 1)
    })
})

module.exports = { listUsers, loginAdmin, updateUserRole, deleteUser }