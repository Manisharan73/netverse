const { buildContainerName } = require('../container.mapper')

module.exports = node => ({
    Image: 'ubuntu:22.04',
    name: buildContainerName(node),
    Tty: true,
    OpenStdin: true,
    Labels: {
        app: 'netverse',
        nodeId: node.id,
        networkId: node.networkId,
        service: 'dhcp'
    },
    Cmd: ["sleep", "infinity"]
})
