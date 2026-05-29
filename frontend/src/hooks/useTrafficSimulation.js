import { useEffect } from 'react'

export default function useTrafficSimulation(setEdges) {
    useEffect(() => {
        const interval = setInterval(() => {
            setEdges((currentEdges) =>
                currentEdges.map((edge) => ({
                    ...edge,
                    data: {
                        ...edge.data,
                        traffic: Math.max(0, (edge.data?.traffic || 0) - 5)
                    }
                }))
            )
        }, 2000)

        return () => clearInterval(interval)
    }, [setEdges])
}
