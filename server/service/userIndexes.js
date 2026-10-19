const User = require("../models/user")

const hasEmailOnlyPhoneIndex = (index) =>
    index.unique === true &&
    index.partialFilterExpression?.phone?.$type === "string" &&
    index.partialFilterExpression.phone.$gt === ""

const ensureUserIndexes = async () => {
    const indexes = await User.collection.indexes()
    const phoneIndexes = indexes.filter(index =>
        index.key?.phone === 1 && Object.keys(index.key).length === 1
    )

    for (const index of phoneIndexes) {
        if (!hasEmailOnlyPhoneIndex(index)) {
            await User.collection.dropIndex(index.name)
        }
    }

    await User.createIndexes()
}

module.exports = { ensureUserIndexes }
