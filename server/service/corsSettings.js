const CorsSettings = require("../models/corsSettings")

let configuredOrigins = []

const getConfiguredCorsOrigins = () => configuredOrigins

const loadCorsOrigins = async () => {
    const settings = await CorsSettings.findOne({ key: "allowed-origins" }).lean()
    configuredOrigins = settings?.origins || []
}

const updateConfiguredCorsOrigins = (origins) => {
    configuredOrigins = origins
}

module.exports = { getConfiguredCorsOrigins, loadCorsOrigins, updateConfiguredCorsOrigins }
