const KEEP_ALIVE_INTERVAL_MS = 13 * 60 * 1000

const startKeepAlive = ({
    serviceUrl = process.env.RENDER_EXTERNAL_URL,
    fetchImpl = globalThis.fetch,
    setIntervalImpl = setInterval,
    logger = console
} = {}) => {
    if (!serviceUrl) return null
    if (typeof fetchImpl !== "function") {
        throw new Error("Fetch is unavailable; cannot start the Render keep-alive request")
    }

    const url = `${serviceUrl.replace(/\/+$/, "")}/`
    const timer = setIntervalImpl(async () => {
        try {
            const response = await fetchImpl(url, { signal: AbortSignal.timeout(10000) })
            if (!response.ok) {
                logger.error(`Render keep-alive request failed with status ${response.status}`)
            }
        } catch (error) {
            logger.error("Render keep-alive request failed:", error)
        }
    }, KEEP_ALIVE_INTERVAL_MS)

    timer.unref?.()
    logger.info(`Render keep-alive request scheduled every 13 minutes for ${url}`)
    return timer
}

module.exports = { KEEP_ALIVE_INTERVAL_MS, startKeepAlive }
