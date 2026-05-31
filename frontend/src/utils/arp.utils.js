import { BROADCAST_MAC } from "./packetTypes"

export async function resolveArp({ sourceNode, targetNode, addEvent, addArpEntry }) {
    addEvent({
        type: 'ARP',
        severity: 'INFO',
        message: `Broadcasting ARP request`
    })

    addEvent({
        type: 'ARP',
        severity: 'INFO',
        message: `ARP Request: Who has ${targetNode.data.ip}?`
    })

    await new Promise((resolve) =>
        setTimeout(resolve, 800)
    )

    addArpEntry(
        sourceNode.id.toString(),
        targetNode.data.ip,
        targetNode.data.mac
    )

    addEvent({
        type: 'ARP',
        severity: 'SUCCESS',
        message: `${targetNode.data.ip} is at ${targetNode.data.mac}`
    })

    return targetNode.data.mac
}