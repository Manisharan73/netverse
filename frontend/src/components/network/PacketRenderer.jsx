import { useMemo } from "react"
import usePacketStore from '../../stores/packet.store'

function PacketRenderer({ nodes }) {
    const packets = usePacketStore((state) => state.packets)

    const nodeMap = useMemo(() => {
        const map = {}

        nodes.forEach((node) => {
            map[node.id] = node
        })

        return map
    }, [nodes])

    return(
        <>
            {packets.map((packet) => {
                const currentNode = nodeMap[[packet.currentNodeId]]

                if(!currentNode) {
                    return null
                }

                return (
                    <div
                        key={packet.id}
                        className="packet-renderer"
                        style={{
                            left: `${currentNode.position.x + 85}px`,
                            top: `${currentNode.position.y + 30}px`
                        }}
                    >
                        <div 
                            className="packet-dot"
                            style={{
                                backgroundColor: packet.color
                            }}
                        />
                    </div>
                )
            })}
        </>
    )
}

export default PacketRenderer