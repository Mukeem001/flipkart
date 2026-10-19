const crypto = require("crypto")

const createEmailOnlyAccountDetails = (email) => {
    const localPart = email.split("@")[0]
    const name = localPart
        .replace(/[._+-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, character => character.toUpperCase())
        .slice(0, 60) || "Flip User"
    const usernameBase = localPart.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 24) || "user"

    return {
        name,
        username: `${usernameBase}_${crypto.randomBytes(6).toString("hex")}`,
        password: crypto.randomBytes(32).toString("base64url")
    }
}

module.exports = { createEmailOnlyAccountDetails }
