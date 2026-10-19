require("dotenv").config();
const dns = require("node:dns")
const dnsServers = process.env.DNS_SERVERS?.split(",").map(server => server.trim()).filter(Boolean)
if (dnsServers?.length) dns.setServers(dnsServers)

const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const app = express();
const productRouter = require("./routes/productsRoute")
const paymentRouter = require("./routes/paymentRoute")
const orderRouter = require("./routes/orderRoute")
const userRouter = require("./routes/userRoute")
const OtpRouter = require("./routes/otpRoutes");
const upiRouter = require("./routes/upiRoute")
const adminRouter = require("./routes/adminRoute")
const smtpSettingsRouter = require("./routes/smtpSettingsRoute")
const { migrateSmtpSettingsFromEnv } = require("./service/smtpSettings")
const corsSettingsRouter = require("./routes/corsSettingsRoute")
const { getConfiguredCorsOrigins, loadCorsOrigins } = require("./service/corsSettings")
const User = require("./models/user")
const { ensureUserIndexes } = require("./service/userIndexes")

const DEMO_USER = {
    name: "Demo User",
    email: process.env.DEMO_EMAIL || "demo@flipkartclone.com",
    username: process.env.DEMO_USERNAME || "demo-user",
    password: process.env.DEMO_PASSWORD || "Demo@123",
    phone: process.env.DEMO_PHONE || "9876543210"
}

const ADMIN_USER = {
    name: "System Admin",
    email: process.env.ADMIN_EMAIL || "admin@flipkartclone.com",
    username: process.env.ADMIN_USERNAME || "admin-flipkart",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    phone: process.env.ADMIN_PHONE || "9999999999"
}

const ensureDemoUser = async () => {
    const existing = await User.findOne({ $or: [{ email: DEMO_USER.email }, { username: DEMO_USER.username }, { phone: DEMO_USER.phone }] })

    if (!existing) {
        const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10)
        await User.create({
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            username: DEMO_USER.username,
            password: hashedPassword,
            phone: DEMO_USER.phone,
            role: "customer"
        })
        console.log(`Demo user created: ${DEMO_USER.email} / ${DEMO_USER.password} / ${DEMO_USER.phone}`)
    } else {
        console.log(`Demo user ready: ${DEMO_USER.email} / ${DEMO_USER.password} / ${DEMO_USER.phone}`)
    }
}

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || "0.0.0.0"

//Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (process.env.NODE_ENV !== "production" ||
            !origin ||
            allowedOrigins.includes(origin) ||
            getConfiguredCorsOrigins().includes(origin)) {
            return callback(null, true)
        }
        return callback(null, false)
    },
    credentials: true
}));
app.use(cookieParser())
app.use(express.json())

//Routers
app.use("/", productRouter)
app.use("/", paymentRouter)
app.use("/", orderRouter)
app.use("/", userRouter)
app.use("/", OtpRouter)
app.use("/", upiRouter)
app.use("/", adminRouter)
app.use("/", smtpSettingsRouter)
app.use("/", corsSettingsRouter)

app.get("/", (req, res) => {
    res.send("server running fine")
})

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" })
})

//Error Handling
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).json({ success: false, message: err.message || "Something went wrong" })
})

//Connection to Database
const ensureAdminUser = async () => {
    const existing = await User.findOne({ $or: [{ email: ADMIN_USER.email }, { username: ADMIN_USER.username }, { phone: ADMIN_USER.phone }] })

    if (!existing) {
        const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10)
        await User.create({
            name: ADMIN_USER.name,
            email: ADMIN_USER.email,
            username: ADMIN_USER.username,
            password: hashedPassword,
            phone: ADMIN_USER.phone,
            role: "admin"
        })
        console.log(`Admin user created: ${ADMIN_USER.email} / ${ADMIN_USER.password}`)
    } else if (existing.role !== "admin") {
        existing.role = "admin"
        await existing.save()
        console.log(`Admin role assigned to existing user: ${existing.email}`)
    } else {
        console.log(`Admin user ready: ${ADMIN_USER.email}`)
    }
}

const startServer = async () => {
    await mongoose.connect(process.env.MONGO_URL)
    await ensureUserIndexes()
    await migrateSmtpSettingsFromEnv()
    await loadCorsOrigins()
    await ensureDemoUser()
    await ensureAdminUser()
    console.log("Connected to database")

    app.listen(PORT, HOST, () => {
        console.log(`connected to ${HOST}:${PORT}`)
    })
}

startServer().catch((err) => {
    console.error("Server startup failed:", err)
    process.exitCode = 1
})