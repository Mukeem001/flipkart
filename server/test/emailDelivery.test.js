const test = require("node:test")
const assert = require("node:assert/strict")
const { assertRecipientAccepted } = require("../service/emailDelivery")

test("SMTP delivery succeeds only when the requested recipient is accepted", () => {
    assert.doesNotThrow(() => assertRecipientAccepted({
        accepted: ["Admin@Example.com"],
        rejected: []
    }, "admin@example.com"))
})

test("SMTP delivery reports a rejected or unaccepted recipient as failure", () => {
    assert.throws(() => assertRecipientAccepted({
        accepted: [],
        rejected: ["admin@example.com"],
        response: "550 mailbox unavailable"
    }, "admin@example.com"), /did not accept the test recipient: 550 mailbox unavailable/)
    assert.throws(() => assertRecipientAccepted({
        accepted: ["other@example.com"],
        rejected: []
    }, "admin@example.com"), /did not accept the test recipient/)
})
