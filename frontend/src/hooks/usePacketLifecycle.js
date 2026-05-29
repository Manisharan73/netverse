import { useEffect } from "react"
import usePacketStore from '../stores/packet.store'

export default function usePacketLifecycle() {
    const packets = usePacketStore((state) => state.packets)
    const removePacket = usePacketStore((state) => state.removePacket)

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now()

            packets.forEach((packet) => {
                const expired = now - packet.createdAt > packet.ttl

                if(expired) {
                    removePacket(packet.id)
                }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [packets, removePacket])
}