const Node = require('../../models/node.model')

async function createNode(data) {
    return await Node.create(data)
}

module.exports = createNode