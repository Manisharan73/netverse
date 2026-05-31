import React, { forwardRef } from 'react'
import usePacketStore from '../../stores/packet.store'

const Packet = forwardRef(({ color, type, packetId }, ref) => {
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
            ref={ref}
            className={packetClass}
            style={{
                backgroundColor: color,
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translate3d(0px, 0px, 0)` // Initial transform
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
})

export default React.memo(Packet)