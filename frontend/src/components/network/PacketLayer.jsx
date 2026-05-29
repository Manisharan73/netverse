import React, { useEffect, useMemo, useRef, useState } from 'react'

import usePacketStore from '../../stores/packet.store'
import Packet from './Packet'

function PacketLayer({ nodes }) {
    const packets = usePacketStore((state) => state.packets)

    const [positions, setPositions] = useState({})

    const animationFrameRef = useRef(null)

    const nodePositions = useMemo(() => {
        const map = {}

        nodes.forEach((node) => {
            map[node.id] = {
                x: node.position.x + 75,
                y: node.position.y + 35
            }
        })

        return map
    }, [nodes])

    useEffect(() => {
        if (!packets.length) {
            setPositions({})
            return
        }

        let startTime = performance.now()

        function animate(now) {
            const elapsed = now - startTime

            const nextPositions = {}

            packets.forEach((packet) => {
                if (!packet.path || packet.path.length < 2) {
                    return
                }

                const totalSegments = packet.path.length - 1

                const progress = Math.min(elapsed / 3000, 1)

                const segmentProgress = progress * totalSegments

                const currentSegment = Math.min(
                    Math.floor(segmentProgress),
                    totalSegments - 1
                )

                const localProgress =
                    segmentProgress - currentSegment

                const sourceId = packet.path[currentSegment]
                const targetId = packet.path[currentSegment + 1]

                const sourcePos = nodePositions[sourceId]
                const targetPos = nodePositions[targetId]

                if (!sourcePos || !targetPos) {
                    return
                }

                const x =
                    sourcePos.x +
                    (targetPos.x - sourcePos.x) * localProgress

                const y =
                    sourcePos.y +
                    (targetPos.y - sourcePos.y) * localProgress

                nextPositions[packet.id] = { x, y }
            })

            setPositions(nextPositions)

            animationFrameRef.current =
                requestAnimationFrame(animate)
        }

        animationFrameRef.current =
            requestAnimationFrame(animate)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [packets, nodePositions])

    return (
        <>
            {
                packets.map((packet) => {
                    const position = positions[packet.id]

                    if (!position) {
                        return null
                    }

                    return (
                        <Packet
                            key={packet.id}
                            x={position.x}
                            y={position.y}
                            color={packet.color}
                            type={packet.type}
                        />
                    )
                })
            }
        </>
    )
}

export default React.memo(PacketLayer)