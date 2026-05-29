import React from "react"
import usePacketStore from '../../stores/packet.store'

function PacketInspector() {
    const selectedPacket = usePacketStore((state) => state.selectedPacket)

    if(!selectedPacket) {
        return null
    }

    return (
        <div className="packet-inspector">
            <h3>Packet Inspector</h3>

            <p>
                Type:
                {' '}
                {selectedPacket.type}
            </p>

            <p>
                Color:
                {' '}
                {selectedPacket.color}
            </p>
        </div>
    )
}

export default React.memo(PacketInspector)