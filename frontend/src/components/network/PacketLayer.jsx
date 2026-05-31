import React, { useEffect, useMemo, useRef } from 'react'
import usePacketStore from '../../stores/packet.store'
import Packet from './Packet'

function PacketLayer({ nodes }) {
    const packetMap = usePacketStore((state) => state.packets)

    const packets = useMemo(
        () => Object.values(packetMap || {}),
        [packetMap]
    )

    const packetsRef = useRef([])
    const nodePositionsRef = useRef({})
    
    // Tracks the current hop animation state for each packet
    const hopAnimationsRef = useRef({})
    const packetRefs = useRef({})
    const animationFrameRef = useRef(null)

    useEffect(() => {
        packetsRef.current = packets
    }, [packets])

    useEffect(() => {
        const map = {}
        nodes.forEach((node) => {
            map[node.id] = {
                x: node.position.x + ((node.width || 200) / 2),
                y: node.position.y + ((node.height || 80) / 2)
            }
        })
        nodePositionsRef.current = map
    }, [nodes])

    useEffect(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        function animate(now) {
            const currentPackets = packetsRef.current
            const positions = nodePositionsRef.current
            const hopAnims = hopAnimationsRef.current

            currentPackets.forEach((packet) => {
                if (!packet || !packet.id) return

                let animState = hopAnims[packet.id]

                // If the packet has moved to a new hop, reset the animation state
                if (!animState || animState.currentLocation !== packet.currentLocation || animState.previousLocation !== packet.previousLocation) {
                    animState = {
                        startTime: now,
                        previousLocation: packet.previousLocation,
                        currentLocation: packet.currentLocation,
                        duration: packet.currentHopLatency || 400
                    }
                    hopAnims[packet.id] = animState
                }

                const { startTime, previousLocation, currentLocation, duration } = animState
                
                const sourceId = previousLocation || packet.sourceId
                const targetId = currentLocation || packet.sourceId

                const sourcePos = positions[sourceId]
                const targetPos = positions[targetId]

                if (!sourcePos || !targetPos) return

                const elapsed = now - startTime
                const progress = Math.min(elapsed / duration, 1)

                // Add a slight easing function for smoother visual
                const easeProgress = progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2

                const currentX = sourcePos.x + (targetPos.x - sourcePos.x) * easeProgress
                const currentY = sourcePos.y + (targetPos.y - sourcePos.y) * easeProgress

                const packetElement = packetRefs.current[packet.id]
                if (packetElement) {
                    packetElement.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
                }
            })

            // Clean up state for removed packets
            const packetIds = new Set(currentPackets.map(p => p.id))
            Object.keys(hopAnims).forEach(id => {
                if (!packetIds.has(id)) {
                    delete hopAnims[id]
                    delete packetRefs.current[id]
                }
            })

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animationFrameRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    return (
        <>
            {packets.map((packet) => (
                <Packet
                    key={packet.id}
                    packetId={packet.id}
                    ref={(el) => {
                        if (el) packetRefs.current[packet.id] = el
                    }}
                    color={packet.color || '#22c55e'}
                    type={packet.type || 'ICMP'}
                />
            ))}
        </>
    )
}

export default React.memo(PacketLayer)