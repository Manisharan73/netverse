const Network = require('./network.model')
const Node = require('./node.model')
const Edge = require('./edge.model')
const User = require('./user.model')
const ArpEntry = require('./arpEntry.model')
const MacEntry = require('./macEntry.model')
const DnsRecord = require('./dnsRecord.model')
const DhcpLease = require('./dhcpLease.model')
const FirewallRule = require('./firewallRule.model')
const NatSession = require('./natSession.model')
const EventLog = require('./eventLog.model')

User.hasMany(Network, { foreignKey: 'userId', onDelete: 'CASCADE' })
Network.belongsTo(User, { foreignKey: 'userId' })

Network.hasMany(Node, { foreignKey: 'networkId', onDelete: 'CASCADE' })
Node.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(Edge, { foreignKey: 'networkId', onDelete: 'CASCADE' })
Edge.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(ArpEntry, { foreignKey: 'networkId', onDelete: 'CASCADE' })
ArpEntry.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(MacEntry, { foreignKey: 'networkId', onDelete: 'CASCADE' })
MacEntry.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(DnsRecord, { foreignKey: 'networkId', onDelete: 'CASCADE' })
DnsRecord.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(DhcpLease, { foreignKey: 'networkId', onDelete: 'CASCADE' })
DhcpLease.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(FirewallRule, { foreignKey: 'networkId', onDelete: 'CASCADE' })
FirewallRule.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(NatSession, { foreignKey: 'networkId', onDelete: 'CASCADE' })
NatSession.belongsTo(Network, { foreignKey: 'networkId' })

Network.hasMany(EventLog, { foreignKey: 'networkId', onDelete: 'CASCADE' })
EventLog.belongsTo(Network, { foreignKey: 'networkId' })

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