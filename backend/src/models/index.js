const Network = require('./network.model')
const Node = require('./node.model')
const Edge = require('./edge.model')

Network.hasMany(Node, { foreignKey: 'networkId', onDelete: 'CASCADE' })
Node.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(Edge, { foreignKey: 'networkId', onDelete: 'CASCADE' })
Edge.belongsTo(Network, { foreignKey: 'networkId' })

Node.hasMany(Edge, {
    foreignKey: 'sourceNodeId',
    as: 'outgoingEdges'
})

Node.hasMany(Edge, {
    foreignKey: 'targetNodeId',
    as: 'incomingEdges'
})

Edge.belongsTo(Node, {
    foreignKey: 'sourceNodeId',
    as: 'sourceNode'
})

Edge.belongsTo(Node, {
    foreignKey: 'targetNodeId',
    as: 'targetNode'
})