const Network = require('./network.model')
const Node = require('./node.model')
const Edge = require('./edge.model')

async function createNetwork(data) {
    const network = await Network.create({
        name: data.name,
        description: data.description
    })

    if(data.nodes?.length) {
        for(const node of data.nodes) {
            await Node.create({
                NetworkId: network.id,
                type: node.type,
                label: node.data.label,
                ipAddress: node.data.ip || '',
                posX: node.position.x,
                posY: node.position.y,
                status: 'ONLINE'
            })
        }
    }

    if(data.edges?.length) {
        for(const edge of data.edges) {
            await Edge.create({
                NetworkId: network.id,
                sourceNodeId: edge.source,
                targetNodeId: edge.target
            })
        }
    }

    return network
}

async function getNetwork() {
    return await Network.findAll({
        include: [
            Node,
            Edge
        ]
    })
}

module.exports = {
    createNetwork,
    getNetwork
}