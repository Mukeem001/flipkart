const test = require("node:test")
const assert = require("node:assert/strict")
const { KEEP_ALIVE_INTERVAL_MS, startKeepAlive } = require("../service/keepAlive")

test("Render keep-alive is skipped when no public service URL is configured", () => {
    assert.equal(startKeepAlive({ serviceUrl: "" }), null)
})

test("Render keep-alive requests the public root every 13 minutes", async () => {
    let scheduledCallback
    let scheduledDelay
    let requestedUrl
    let loggedMessage
    const timer = { unrefCalled: false, unref() { this.unrefCalled = true } }

    const result = startKeepAlive({
        serviceUrl: "https://flipkart-wvca.onrender.com/",
        fetchImpl: async url => {
            requestedUrl = url
            return { ok: true, status: 200 }
        },
        setIntervalImpl: (callback, delay) => {
            scheduledCallback = callback
            scheduledDelay = delay
            return timer
        },
        logger: { info: message => { loggedMessage = message }, error: assert.fail }
    })

    assert.equal(result, timer)
    assert.equal(scheduledDelay, KEEP_ALIVE_INTERVAL_MS)
    assert.equal(timer.unrefCalled, true)
    assert.match(loggedMessage, /every 13 minutes/)

    await scheduledCallback()
    assert.equal(requestedUrl, "https://flipkart-wvca.onrender.com/")
})

test("Render keep-alive logs request errors", async () => {
    const expectedError = new Error("network unavailable")
    let scheduledCallback
    let loggedError

    startKeepAlive({
        serviceUrl: "https://flipkart-wvca.onrender.com",
        fetchImpl: async () => { throw expectedError },
        setIntervalImpl: callback => {
            scheduledCallback = callback
            return { unref() {} }
        },
        logger: { info() {}, error: (...args) => { loggedError = args } }
    })

    await scheduledCallback()
    assert.deepEqual(loggedError, ["Render keep-alive request failed:", expectedError])
})
