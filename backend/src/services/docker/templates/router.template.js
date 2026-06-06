const { buildContainerName } = require('../container.mapper')

module.exports = node => ({
    Image: 'frrouting/frr:latest',
    name: buildContainerName(node),
    Tty: true,
    OpenStdin: true,
    Labels: {
        app: 'netverse',
        nodeId: node.id,
        networkId: node.networkId,
        type: 'router'
    },
    Cmd: ["sleep", "infinity"]
})
