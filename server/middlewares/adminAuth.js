const jwt = require("jsonwebtoken")

const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || ""

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Admin authentication required."
        })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin role required."
            })
        }

        req.user = {
            _id: decoded._id,
            role: decoded.role
        }

        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin token."
        })
    }
}

module.exports = adminAuth
