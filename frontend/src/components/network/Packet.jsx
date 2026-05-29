import React from 'react'
import usePacketStore from '../../stores/packet.store'

function Packet({ x, y, color, type }) {
    let packetClass = 'packet'

    const setSelectedPacket = usePacketStore((state) => state.setSelectedPacket)

    switch (type) {
        case 'HTTP':
            packetClass += ' packet-http'
            break

        case 'HTTPS':
            packetClass += ' packet-https'
            break

        case 'DNS':
            packetClass += ' packet-dns'
            break

        case 'VOIP':
            packetClass += ' packet-voip'
            break

        default:
            packetClass += ' packet-icmp'
    }

    return (
        <div
            className={packetClass}
            style={{
                transform: `translate3d(${x}px, ${y}px, 0)`,
                backgroundColor: color
            }}
            onClick={() =>
                setSelectedPacket({
                    type,
                    color
                })
            }
        >
            <span className="packet-label">
                {type}
            </span>
        </div>
    )
}

export default React.memo(Packet)