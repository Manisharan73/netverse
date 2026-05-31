const Edge = require('../../models/edge.model')

async function createEdge(data) {
    return await Edge.create(data)
}

module.exports = createEdge