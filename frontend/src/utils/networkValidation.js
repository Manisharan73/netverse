import { isValidIp, isNodeReachable, sameVlan, canRouteInterVlan } from './network.utils'
import { isTrafficAllowed } from './firewall.utils'
import { sameSubnet, canRouteExternally } from './subnet.utils'

export function validateConnectivity({
    selectedNode,
    targetNode,
    packetType,
    firewallRules,
    path,
    nodes,
    addEvent
}) {
    if (!targetNode) return false

    if (selectedNode.id.toString() === targetNode.id.toString()) return false

    if (!isValidIp(selectedNode.data.ip) || !isValidIp(targetNode.data.ip)) {
        addEvent({ type: 'PING', severity: 'ERROR', message: 'Invalid IP configuration' })
        return false
    }

    const allowed = isTrafficAllowed({
        rules: firewallRules,
        sourceIp: selectedNode.data.ip,
        targetIp: targetNode.data.ip,
        protocol: packetType
    })

    if (!allowed) {
        addEvent({ type: 'FIREWALL', severity: 'ERROR', message: `${packetType} blocked by firewall` })
        return false
    }

    if (!path) {
        addEvent({ type: 'PING', severity: 'ERROR', message: 'Destination unreachable' })
        return false
    }

    const reachable = isNodeReachable(path, nodes)
    if (!reachable) {
        addEvent({ type: 'ROUTING', severity: 'ERROR', message: 'Route contains offline node' })
        return false
    }

    const localNetwork = sameSubnet(selectedNode.data.ip, targetNode.data.ip)
    const vlanMatch = sameVlan(selectedNode, targetNode)
    const interVlanRouting = canRouteInterVlan({ path, nodes })

    if (!vlanMatch && !interVlanRouting) {
        addEvent({ type: 'VLAN', severity: 'ERROR', message: `VLAN mismatch (${selectedNode.data.vlan} -> ${targetNode.data.vlan})` })
        return false
    }

    if (!vlanMatch && interVlanRouting) {
        addEvent({ type: 'VLAN', severity: 'INFO', message: `Inter-VLAN routing active (${selectedNode.data.vlan} -> ${targetNode.data.vlan})` })
    }

    if (!localNetwork && !selectedNode.data.gateway) {
        addEvent({ type: 'ROUTING', severity: 'ERROR', message: 'No gateway configured' })
        return false
    }

    const gatewayAvailable = canRouteExternally({ sourceNode: selectedNode, targetNode, nodes, path })
    if (!localNetwork && !gatewayAvailable) {
        addEvent({ type: 'ROUTING', severity: 'ERROR', message: 'No router available for cross-network routing' })
        return false
    }

    if (!localNetwork && selectedNode.data.gateway === targetNode.data.gateway) {
        addEvent({ type: 'ROUTING', severity: 'INFO', message: 'Traffic forwarded through shared gateway' })
    }

    return true
}
