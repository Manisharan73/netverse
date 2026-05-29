import { useEffect } from "react"

export default function useEdgeMonitoring({ setEdges }) {
    useEffect(() => {
        const interval = setInterval(() => {
            setEdges((currentEdges) =>
                currentEdges.map((edge) => {
                    const edgeData = edge.data || []

                    let traffic = edgeData.traffic || 0

                    traffic = Math.max(0, traffic - 3)

                    let status = 'ONLINE'

                    if(traffic > 120) {
                        status = 'CONGESTED'
                    }

                    if(edgeData.status === 'OFFLINE') {
                        status = 'OFFLINE'
                    }

                    let packetLoss = edgeData.packetLoss || 0

                    if(status === 'CONGESTED') {
                        packetLoss = Math.min(0.4, packetLoss + 0.01)
                    } else {
                        packetLoss = Math.max(0.01, packetLoss - 0.01)
                    }

                    return {
                        ...edge,

                        data: {
                            ...edge.data,

                            traffic,
                            packetLoss,
                            status
                        }
                    }
                })
            )
        }, 3000)

        return () => clearInterval(interval)
    }, [setEdges])
}