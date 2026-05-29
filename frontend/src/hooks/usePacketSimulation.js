import { useEffect } from "react"
import usePacketStore from '../stores/packet.store'

export default function usePacketSimulation({ nodes, edges }) {
    const packets = usePacketStore((state) => state.packets)
    const updatePacket = usePacketStore((state) => state.updatePacket)
    const removePacket = usePacketStore((state) => state.removePacket)

    useEffect(() => {
        const interval = setInterval(() => {
            packets.forEach((packet) => {
                if(packet.status !== 'MOVING') {
                    return
                }

                const nextProgress = packet.progress + 0.05

                if(nextProgress < 1) {
                    updatePacket(packet.id, (current) => ({
                        ...current,
                        progress: nextProgress
                    }))

                    return
                }

                const nextHop = packet.currentHopIndex + 1

                if(nextHop >= packet.path.length - 1) {
                    updatePacket(packet.id, (current) => ({
                        ...current,
                        progress: 0,
                        status: 'DELIVERED'
                    }))
                }
            })
        }, 50)

        return () => clearInterval(interval)
    }, [packets, updatePacket, removePacket])
}