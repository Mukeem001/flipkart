const isValidProductCost = cost => typeof cost === "number" && Number.isFinite(cost) && cost > 0

module.exports = { isValidProductCost }
