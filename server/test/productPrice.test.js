const test = require("node:test")
const assert = require("node:assert/strict")
const { isValidProductCost } = require("../service/productPrice")

test("product price accepts positive finite numbers", () => {
    assert.equal(isValidProductCost(1), true)
    assert.equal(isValidProductCost(1299.99), true)
})

test("product price rejects zero, negative, non-numeric, and non-finite values", () => {
    for (const cost of [0, -1, "1299", NaN, Infinity, null, undefined]) {
        assert.equal(isValidProductCost(cost), false)
    }
})
