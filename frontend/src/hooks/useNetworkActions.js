import { useCallback } from 'react'
import socket from '../websocket/socket'
import { addEdge } from 'reactflow'
import { createNetwork, updateNetwork, getNetworkById } from '../services/network.service'
import toast from 'react-hot-toast'
import { createNodeFromTemplate } from '../utils/createNodeFromTemplate'
import { DEVICE_TEMPLATES, SWITCH_TEMPLATE } from '../constants/deviceTemplates'
import useNetworkStore from '../stores/network.store'

const FRONTEND_NODE_TYPE_MAP = {
    ROUTER: 'routerNode',
    SWITCH: 'switchNode',
    SERVER: 'serverNode',
    HOST: 'hostNode'
}

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

    const saveNetwork = async (name, description) => {
        try {
            const currentNetwork = useNetworkStore.getState().currentNetwork
            const metricsMap = useNetworkStore.getState().nodeMetrics

            const payloadNodes = nodes.map(node => ({
                ...node,
                metrics: metricsMap[node.id] || null
            }))

            const networkData = {
                name: name || currentNetwork?.name || 'Untitled Network',
                description: description !== undefined ? description : (currentNetwork?.description || ''),
                nodes: payloadNodes,
                edges
            }

            if (currentNetworkId) {
                const updatedNetwork = await updateNetwork(currentNetworkId, networkData)
                setCurrentNetwork(updatedNetwork)
                toast.success('Network updated')
            } else {
                const network = await createNetwork(networkData)
                setCurrentNetwork(network)
                setCurrentNetworkId(network.id)
                toast.success('Network saved')
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to save network')
        }
    }

    const loadNetwork = useCallback(async (networkIdToLoad) => {
        const idToUse = networkIdToLoad || currentNetworkId
        if (!idToUse) {
            setError('No network selected')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const network = await getNetworkById(idToUse)
            setCurrentNetworkId(network.id)
            setCurrentNetwork(network)

            const formattedNodes = []
            const parsedMetrics = {}

            const dbToFrontendNodeMap = {}

            network.Nodes.forEach((node) => {
                const id = node.frontendId.toString()
                dbToFrontendNodeMap[node.id] = id

                formattedNodes.push({
                    id,
                    type: FRONTEND_NODE_TYPE_MAP[node.type] || 'hostNode',
                    position: { x: Number(node.posX) || 0, y: Number(node.posY) || 0 },
                    data: {
                        label: node.label || 'Node', ip: node.ipAddress || '', subnet: node.subnet || '', gateway: node.gateway || '', os: node.os || '', hostname: node.hostname || '', macAddress: node.macAddress || ''
                    }
                })

                parsedMetrics[id] = node.metrics || {
                    status: node.status || 'ONLINE', cpu: '0%', ram: '0%', storage: '0%', traffic: 0, packetsSent: 0, packetsReceived: 0, packetLoss: 0, uptime: 0, services: []
                }
            })

            const formattedEdges = network.Edges.map((edge) => ({
                id: edge.id.toString(),
                source: dbToFrontendNodeMap[edge.sourceNodeId] || edge.sourceNodeId.toString(),
                target: dbToFrontendNodeMap[edge.targetNodeId] || edge.targetNodeId.toString(),
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
