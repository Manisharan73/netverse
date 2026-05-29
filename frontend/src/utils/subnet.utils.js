export function getSubnet(ip) {
    if (!ip) {
        return ''
    }

    return ip.split('.').slice(0, 3).join('.')
}

export function sameSubnet(ip1, ip2) {
    return getSubnet(ip1) === getSubnet(ip2)
}

export function canRouteExternally({ sourceNode, targetNode, nodes, path }) {
    const sourceGateway = sourceNode.data?.gateway

    if (!sourceGateway) {
        return false
    }

    for (const nodeId of path) {
        const node = nodes.find((n) => n.id.toString() === nodeId.toString())

        if (!node) {
            continue
        }

        if (node.type !== 'routerNode') {
            continue
        }

        if (node.data?.ip === sourceGateway) {
            return true
        }
    }

    return false
}