const Network = require('./network.model')
const Node = require('./node.model')
const Edge = require('./edge.model')

Network.hasMany(Node)
Node.belongsTo(Network)

Network.hasMany(Edge)
Edge.belongsTo(Network)