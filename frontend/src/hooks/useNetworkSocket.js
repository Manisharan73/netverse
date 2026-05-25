import { useEffect } from 'react'
import { addEdge } from 'reactflow'
import socket from '../websocket/socket'

export default function useNetworkSocket({ setNodes, setEdges, setSelectedNode }) {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected: ', socket.id)
        })

        socket.on('node:added', (node) => {
            setNodes((nodes) => {
                const exists = nodes.some(n => n.id.toString() === node.id.toString())
                if (exists) return nodes
                return [...nodes, node]
            })
        })

        socket.on('node:moved', (data) => {
            setNodes((currentNodes) =>
                currentNodes.map((node) => {
                    if (node.id.toString() === data.id.toString()) {
                        return {
                            ...node,
                            position: {
                                x: Number(data.position.x),
                                y: Number(data.position.y)
                            }
                        }
                    }

                    return node
                })
            )
        })

        socket.on('edge:added', (edge) => {
            setEdges((edges) => {
                const exists = edges.some(e => 
                    e.source.toString() === edge.source.toString() && 
                    e.target.toString() === edge.target.toString()
                )
                if (exists) return edges
                return addEdge(edge, edges)
            })
        })

        socket.on('node:deleted', (data) => {
            setEdges((edges) =>
                edges.filter((edge) =>
                    edge.source.toString() !== data.id.toString()
                    &&
                    edge.target.toString() !== data.id.toString()
                )
            )

            setNodes((nodes) =>
                nodes.filter((node) => node.id.toString() !== data.id.toString())
            )
        })

        socket.on('edge:deleted', (data) => {
            setEdges((edges) => edges.filter((edge) => edge.id.toString() !== data.id.toString()))
        })

        socket.on('node:labelUpdated', (data) => {
            setNodes((currentNodes) =>
                currentNodes.map((node) => {
                    if (node.id.toString() === data.id.toString()) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: data.label
                            }
                        }
                    }

                    return node
                })
            )

            setSelectedNode((prev) => {
                if (!prev || prev.id.toString() !== data.id.toString()) {
                    return prev
                }

                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        label: data.label
                    }
                }
            })
        })

        return () => {
            socket.off('connect')
            socket.off('node:added')
            socket.off('node:moved')
            socket.off('edge:added')
            socket.off('node:deleted')
            socket.off('edge:deleted')
            socket.off('node:labelUpdated')
        }
    }, [setNodes, setEdges, setSelectedNode])
}
