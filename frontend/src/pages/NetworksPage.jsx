import { useNodesState, useEdgesState, addEdge } from 'reactflow'
import 'reactflow/dist/style.css'
import AppLayout from '../layouts/AppLayout'
import '../styles/networks.css'
import RouterNode from '../components/nodes/RouterNode'
import ServerNode from '../components/nodes/ServerNode'
import SwitchNode from '../components/nodes/SwitchNode'
import { createNetwork, getNetworkById, updateNetwork } from '../services/network.service'
import useNetworkStore from '../stores/network.store'
import usePacketStore from '../stores/packet.store'
import useEventStore from '../stores/event.store'
import useStpStore from '../stores/stp.store'
import { electRootBridge, detectLoops } from '../utils/stp.utils'
import { useState, useEffect, useMemo, useCallback } from 'react'
import socket from '../websocket/socket'
import { v4 as uuidv4 } from 'uuid'

import { INITIAL_NODES, INITIAL_EDGES, DEFAULT_ROUTER_DATA, DEFAULT_ROUTER_METRICS, DEFAULT_SERVER_DATA, DEFAULT_SERVER_METRICS } from '../constants/networkDefaults'

import useNetworkSocket from '../hooks/useNetworkSocket'
import usePingSimulation from '../hooks/usePingSimulation'
import useMonitoringSimulation from '../hooks/useMonitoringSimulation'
import useAutoSave from '../hooks/useAutoSave'
import useNetworkStats from '../hooks/useNetworkStats'
import useRoutingTable from '../hooks/useRoutingTable'
import useRoutingEngine from '../hooks/useRoutingEngine'
import useTrafficSimulation from '../hooks/useTrafficSimulation'
import usePacketSimulation from '../hooks/usePacketSimulation'
import useEdgeMonitoring from '../hooks/useEdgeMonitoring'
import usePacketLifecycle from '../hooks/usePacketLifecycle'

import ConfigPanel from '../components/network/ConfigPanel'
import NetworkCanvas from '../components/network/NetworkCanvas'
import TerminalPanel from '../components/network/TerminalPanel'
import NetworkToolbar from '../components/network/NetworkToolbar'
import NetworkStats from '../components/network/NetworkStats'
import AnalyticsPanel from '../components/network/AnalyticsPanel'
import AlertsPanel from '../components/network/AlertsPanel'
import IncidentsPanel from '../components/network/IncidentsPanel'
import RoutingPanel from '../components/network/RoutingPanel'
import PacketLayer from '../components/network/PacketLayer'
import PacketRenderer from '../components/network/PacketRenderer'
import LinkConfigPanel from '../components/network/LinkConfigPanel'
import PacketInspector from '../components/network/PacketInspector'
import EventTimeline from '../components/network/EventTimeline'
import MacTablePanel from '../components/network/MacTablePanel'

import { DEVICE_TEMPLATES, SWITCH_TEMPLATE } from '../constants/deviceTemplates'
import { createNodeFromTemplate } from '../utils/createNodeFromTemplate'
import { exportSimulationState, importSimulationState } from '../utils/networkSerializer'

function NetworksPage() {

    const nodeTypes = useMemo(() => ({
        routerNode: RouterNode,
        serverNode: ServerNode,
        switchNode: SwitchNode
    }), [])

    const [nodes, setNodes, onNodesChangeReactFlow] = useNodesState(INITIAL_NODES)
    const [edges, setEdges, onEdgesChangeReactFlow] = useEdgesState(INITIAL_EDGES)
    const [currentNetworkId, setCurrentNetworkId] = useState(null)
    const [selectedNode, setSelectedNode] = useState(null)
    const [selectedEdge, setSelectedEdge] = useState(null)
    const [saveStatus, setSaveStatus] = useState('Saved')
    const addEvent = useEventStore((state) => state.addEvent)
    const [pingTarget, setPingTarget] = useState('')
    const [alerts, setAlerts] = useState([])
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const setCurrentNetwork = useNetworkStore((state) => state.setCurrentNetwork)
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)
    const setNodeMetrics = useNetworkStore((state) => state.setNodeMetrics)
    const updateNodeMetricById = useNetworkStore((state) => state.updateNodeMetricById)

    const packets = usePacketStore((state) => state.packets)

    const setRootBridge = useStpStore((state) => state.setRootBridge)
    const setBlockedEdges = useStpStore((state) => state.setBlockedEdges)
    const blockedEdges = useStpStore((state) => state.blockedEdges)

    useNetworkSocket({ setNodes, setEdges, setSelectedNode })

    useEdgeMonitoring({ setEdges })

    usePacketLifecycle()

    // usePacketSimulation({ nodes, edges})

    const { graph, getRoute, getRouteLatency } = useRoutingEngine(nodes, edges)

    useEffect(() => {
        const rootBridge = electRootBridge(nodes)
        setRootBridge(rootBridge)

        const blocked = detectLoops(nodes, edges)
        setBlockedEdges(blocked)

        if (blocked.length > 0) {
            setAlerts((prev) => [
                {
                    id: crypto.randomUUID(),
                    severity: 'WARNING',
                    message: `STP blocked ${blocked.length} redundant links`
                },
                ...prev
            ])
        }
    }, [nodes, edges])

    const { pingNode, activeEdges, edgeStatus } = usePingSimulation({
        nodes,
        edges,
        setEdges,
        getRoute,
        getRouteLatency,
        selectedNode,
        pingTarget
    })

    useMonitoringSimulation({ nodes, setIncidents, setAlerts })

    useTrafficSimulation(setEdges)

    useAutoSave({ currentNetworkId, nodes, edges, setSaveStatus })

    const stats = useNetworkStats({ nodes, edges, nodeMetrics })

    const { routingTable } = useRoutingTable({
        nodes,
        edges,
        graph,
        getRoute,
        getRouteLatency
    })

    const onNodesChange = useCallback((changes) => {
        onNodesChangeReactFlow(changes)
    }, [onNodesChangeReactFlow])

    const onEdgesChange = useCallback((changes) => {
        changes.forEach(change => {
            if (change.type === 'remove') {
                socket.emit('edge:delete', { id: change.id })
            }
        })
        onEdgesChangeReactFlow(changes)
    }, [onEdgesChangeReactFlow])

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node)
        setSelectedEdge(null)
    }, [])

    const onEdgeClick = useCallback((event, edge) => {
        setSelectedEdge(edge)
        setSelectedNode(null)
    }, [])

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

    async function saveNetwork() {
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
                alert('Netwrok updated!')
            }
            else {
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

    function addRouter() {
        const newNode = createNodeFromTemplate(DEVICE_TEMPLATES.CISCO_ROUTER)

        setNodes((nodes) => [
            ...nodes,
            newNode
        ])

        socket.emit('node:add', newNode)
    }

    function addServer() {
        const newNode = createNodeFromTemplate(DEVICE_TEMPLATES.LINUX_SERVER)

        setNodes((nodes) => [
            ...nodes,
            newNode
        ])

        socket.emit('node:add', newNode)
    }

    function addSwitch() {
        const newNode = createNodeFromTemplate(SWITCH_TEMPLATE)

        setNodes((nodes) => [
            ...nodes,
            newNode
        ])

        socket.emit('node:add', newNode)
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
    }, [setCurrentNetworkId, setNodes, setEdges, setNodeMetrics])

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
    }, [selectedNode, setEdges, setNodes])

    const onNodeDragStop = useCallback((event, node) => {
        socket.emit('node:move', {
            id: node.id,
            position: { x: node.position.x, y: node.position.y }
        })
    }, [])

    const updateServiceStatus = useCallback((nodeId, serviceId, newStatus) => {
        updateNodeMetricById(nodeId, (metric) => {
            return {
                ...metric,
                services: (metric.services || []).map((service) => {
                    if (service.id !== serviceId) return service
                    return { ...service, status: newStatus }
                })
            }
        })
    }, [updateNodeMetricById])

    const restartService = useCallback((nodeId, serviceId) => {
        updateServiceStatus(nodeId, serviceId, 'RESTARTING')
        setTimeout(() => {
            updateServiceStatus(nodeId, serviceId, 'RUNNING')
        }, 3000)
    }, [updateServiceStatus])

    const deployUpdate = useCallback((nodeId) => {
        addEvent({ type: 'DEPLOYMENT', severity: 'INFO', message: 'Starting deployment...' })
        updateServiceStatus(nodeId, 1, 'RESTARTING')
        updateServiceStatus(nodeId, 2, 'RESTARTING')

        setTimeout(() => {
            updateServiceStatus(nodeId, 1, 'RUNNING')
            updateServiceStatus(nodeId, 2, 'RUNNING')
            addEvent({ type: 'DEPLOYMENT', severity: 'SUCCESS', message: 'Deployment successful' })
        }, 5000)
    }, [updateServiceStatus, addEvent])

    const nodeMap = useMemo(() => {
        const map = {}
        nodes.forEach((node) => {
            map[node.id.toString()] = node
        })
        return map
    }, [nodes])

    const animatedEdges = useMemo(() => {
        return edges.map((edge) => {
            const sourceNode = nodeMap[edge.source.toString()]
            const targetNode = nodeMap[edge.target.toString()]

            const edgeData = edge.data || {}

            const isBlocked = blockedEdges.includes(edge.id)

            const relatedTraffic = edgeData.traffic || 0

            let edgeWidth = Math.min(8, 2 + relatedTraffic / 25)

            let edgeColor = '#22c55e'

            if (relatedTraffic > 70) {
                edgeColor = '#f59e0b'
            }

            if (relatedTraffic > 120) {
                edgeColor = '#ef4444'
            }

            if (edgeData.status === 'OFFLINE') {
                edgeColor = '#991b1b'
                edgeWidth = 4
            }

            if (activeEdges.includes(edge.id)) {
                edgeColor = edgeStatus === 'failed' ? '#ef4444' : '#22c55e'
                edgeWidth = 5
            }

            const sourceStatus = nodeMetrics[sourceNode?.id]?.status
            const targetStatus = nodeMetrics[targetNode?.id]?.status

            if (sourceMetric.status === 'OFFLINE' || targetMetric.status === 'OFFLINE') {
                edgeColor = '#991b1b'
                edgeWidth = 4
            }

            if (edgeData.status === 'CONGESTED') {
                edgeColor = '#f97316'
            }

            if (isBlocked) {
                edgeColor = '#f59e0b'
                edgeWidth = 3
            }

            return {
                ...edge,
                type: 'custom',
                animated: activeEdges.includes(edge.id) && edgeData.status !== 'OFFLINE',

                style: {
                    stroke: edgeColor,
                    strokeWidth: edgeWidth
                }
            }
        })
    }, [edges, nodes, activeEdges, edgeStatus, nodeMetrics])

    return (
        <AppLayout saveStatus={saveStatus}>
            {loading && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}
            {error && <div className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded z-50">{error}</div>}

            <NetworkStats {...stats} />

            <NetworkToolbar
                addRouter={addRouter}
                addServer={addServer}
                addSwitch={addSwitch}
                saveNetwork={saveNetwork}
                loadNetwork={loadNetwork}
            />

            <ConfigPanel
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                nodes={nodes}
                setNodes={setNodes}
                setEdges={setEdges}
                setSelectedNode={setSelectedNode}
                setSelectedEdge={setSelectedEdge}
                pingTarget={pingTarget}
                setPingTarget={setPingTarget}
                pingNode={pingNode}
                deleteSelectedNode={deleteSelectedNode}
                updateServiceStatus={updateServiceStatus}
                restartService={restartService}
                deployUpdate={deployUpdate}
            />

            <LinkConfigPanel
                selectedEdge={selectedEdge}
                setEdges={setEdges}
            />

            <NetworkCanvas
                nodes={nodes}
                edges={animatedEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onNodeDragStop={onNodeDragStop}
            />

            <PacketLayer
                packets={packets}
                nodes={nodes}
            />

            <PacketInspector />

            <IncidentsPanel incidents={incidents} />

            <AlertsPanel alerts={alerts} />

            <RoutingPanel routingTable={routingTable} />

            <MacTablePanel />

            <EventTimeline />
        </AppLayout>
    )
}

export default NetworksPage