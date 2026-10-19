const test = require("node:test")
const assert = require("node:assert/strict")
const User = require("../models/user")
const { createEmailOnlyAccountDetails } = require("../service/emailOnlyAccount")

test("email-only account details derive a readable name without inventing a phone number", () => {
    const details = createEmailOnlyAccountDetails("first.last+shop@example.com")

    assert.equal(details.name, "First Last Shop")
    assert.equal("phone" in details, false)
    assert.ok(details.password.length >= 32)
})

test("email-only accounts receive unique usernames", () => {
    const first = createEmailOnlyAccountDetails("customer@example.com")
    const second = createEmailOnlyAccountDetails("customer@example.com")

    assert.notEqual(first.username, second.username)
    assert.match(first.username, /^customer_[a-f0-9]{12}$/)
})

test("phone remains optional while phone numbers stay unique when provided", () => {
    const phonePath = User.schema.path("phone")
    const phoneIndex = User.schema.indexes().find(([fields]) => fields.phone === 1)

    assert.equal(Boolean(phonePath.isRequired), false)
    assert.equal(phoneIndex[1].unique, true)
    assert.deepEqual(phoneIndex[1].partialFilterExpression, {
        phone: { $type: "string", $gt: "" }
    })
})
