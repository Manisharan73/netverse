import { useCallback } from 'react'
import socket from '../websocket/socket'
import { addEdge } from 'reactflow'
import { createNetwork, updateNetwork, getNetworkById } from '../services/network.service'
import { exportSimulationState, importSimulationState } from '../utils/networkSerializer'
import { createNodeFromTemplate } from '../utils/createNodeFromTemplate'
import { DEVICE_TEMPLATES, SWITCH_TEMPLATE } from '../constants/deviceTemplates'

export default function useNetworkActions({
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNode,
    setSelectedNode,
    currentNetworkId,
    setCurrentNetworkId,
    setCurrentNetwork,
    setNodeMetrics,
    setLoading,
    setError
}) {
    const onConnect = useCallback((connection) => {
        const exists = edges.some((edge) =>
            (edge.source === connection.source && edge.target === connection.target)
            ||
            (edge.source === connection.target && edge.target === connection.source)
        )

        if (exists) {
            return
        }

        const newEdge = {
            ...connection,
            id: `e${connection.source}-${connection.target}`,
            animated: true,
            type: 'custom',

            data: {
                bandwidth: 100,
                latency: 10,
                packetLoss: 0.02,
                status: 'ONLINE',
                traffic: 0
            }
        }

        setEdges((edges) => addEdge(newEdge, edges))
        socket.emit('edge:add', newEdge)
    }, [edges, setEdges])

    const saveNetwork = async () => {
        try {
            const networkData = {
                name: 'My Infrastructure',
                description: 'NetVerse Topology',
                nodes,
                edges,
                simulation: exportSimulationState()
            }

            if (currentNetworkId) {
                await updateNetwork(currentNetworkId, networkData)
                alert('Network updated!')
            } else {
                const network = await createNetwork(networkData)
                setCurrentNetwork(network)
                setCurrentNetworkId(network.id)
                alert('Network saved!')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to save network!')
        }
    }

    const loadNetwork = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const network = await getNetworkById(3)
            setCurrentNetworkId(network.id)

            const formattedNodes = []
            const parsedMetrics = {}

            network.Nodes.forEach((node) => {
                const id = node.frontendId.toString()
                formattedNodes.push({
                    id,
                    type: node.type || 'default',
                    position: { x: Number(node.posX) || 0, y: Number(node.posY) || 0 },
                    data: {
                        label: node.label || 'Node', ip: node.ip || '', subnet: node.subnet || '', gateway: node.gateway || '', os: node.os || ''
                    }
                })

                parsedMetrics[id] = {
                    status: node.status || 'ONLINE', cpu: node.cpu || '0%', ram: node.ram || '0%', storage: node.storage || '0%', traffic: node.traffic || 0, packetsSent: node.packetsSent || 0, packetsReceived: node.packetsReceived || 0, packetLoss: node.packetLoss || 0, uptime: node.uptime || '', services: node.services || []
                }
            })

            const formattedEdges = network.Edges.map((edge) => ({
                id: edge.id.toString(),
                source: edge.sourceNodeId.toString(),
                target: edge.targetNodeId.toString(),
                animated: true,
                type: 'custom',

                data: {
                    bandwidth: edge.bandwidth || 100,
                    latency: edge.latency || 10,
                    packetLoss: edge.packetLoss || 0.02,
                    status: edge.status || 'ONLINE',
                    traffic: edge.traffic || 0
                }
            }))

            setNodes(formattedNodes)
            setEdges(formattedEdges)
            setNodeMetrics(parsedMetrics)

            if (network.simulation) {
                importSimulationState({ simulation: network.simulation })
            }
        } catch (err) {
            console.error(err)
            setError('Failed to load network!')
        } finally {
            setLoading(false)
        }
    }, [setCurrentNetworkId, setNodes, setEdges, setNodeMetrics, setLoading, setError])

    const deleteSelectedNode = useCallback(() => {
        if (!selectedNode) return

        setEdges((edges) =>
            edges.filter((edge) =>
                edge.source.toString() !== selectedNode.id.toString() &&
                edge.target.toString() !== selectedNode.id.toString()
            )
        )

        setNodes((nodes) =>
            nodes.filter((node) => node.id.toString() !== selectedNode.id.toString())
        )

        socket.emit('node:delete', { id: selectedNode.id })
        setSelectedNode(null)
    }, [selectedNode, setEdges, setNodes, setSelectedNode])

    const addRouter = () => {
        const newNode = createNodeFromTemplate(DEVICE_TEMPLATES.CISCO_ROUTER)
        setNodes((nodes) => [...nodes, newNode])
        socket.emit('node:add', newNode)
    }

    const addServer = () => {
        const newNode = createNodeFromTemplate(DEVICE_TEMPLATES.LINUX_SERVER)
        setNodes((nodes) => [...nodes, newNode])
        socket.emit('node:add', newNode)
    }

    const addSwitch = () => {
        const newNode = createNodeFromTemplate(SWITCH_TEMPLATE)
        setNodes((nodes) => [...nodes, newNode])
        socket.emit('node:add', newNode)
    }

    return {
        onConnect,
        saveNetwork,
        loadNetwork,
        deleteSelectedNode,
        addRouter,
        addServer,
        addSwitch
    }
}
