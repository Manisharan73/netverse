import { useEffect } from 'react'

export default function useTrafficSimulation(setEdges) {
    useEffect(() => {
        const interval = setInterval(() => {
            setEdges((currentEdges) =>
                currentEdges.map((edge) => {
                    const currentTraffic = edge.data?.traffic || 0
                    
                    if (currentTraffic === 0) return edge

                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            traffic: Math.max(0, currentTraffic - 2)
                        }
                    }
                })
            )
        }, 1000)

        return () => clearInterval(interval)
    }, [setEdges])
}
