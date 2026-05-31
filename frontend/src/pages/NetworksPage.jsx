import { useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import AppLayout from '../layouts/AppLayout'
import RouterNode from '../components/nodes/RouterNode'
import ServerNode from '../components/nodes/ServerNode'
import SwitchNode from '../components/nodes/SwitchNode'
import { createNetwork, getNetworkById, updateNetwork } from '../services/network.service'
import useNetworkStore from '../stores/network.store'
import useEventStore from '../stores/event.store'
import useStpStore from '../stores/stp.store'
import { calculateStp } from '../utils/stp.utils'
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
import usePacketSimulation from '../hooks/usePacketSimulation'
import useEdgeMonitoring from '../hooks/useEdgeMonitoring'
import usePacketLifecycle from '../hooks/usePacketLifecycle'
import useNetworkActions from '../hooks/useNetworkActions'
import useRoutingEngine from '../hooks/useRoutingEngine'
import useTrafficSimulation from '../hooks/useTrafficSimulation'

import NetworkCanvas from '../components/network/NetworkCanvas'
import NetworkToolbar from '../components/network/NetworkToolbar'
import NetworkStats from '../components/network/NetworkStats'
import ControlPanelSidebar from '../components/network/ControlPanelSidebar'

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

    const setRootBridge = useStpStore((state) => state.setRootBridge)
    const setBlockedEdges = useStpStore((state) => state.setBlockedEdges)
    const blockedEdges = useStpStore((state) => state.blockedEdges)

    useNetworkSocket({ setNodes, setEdges, setSelectedNode })

    useEdgeMonitoring({ setEdges })

    usePacketLifecycle()

    // usePacketSimulation({ nodes, edges})

    const { graph, getRoute, getRouteLatency } = useRoutingEngine(nodes, edges)

    useEffect(() => {
        const { rootBridge, blockedEdges: blocked, portStates } = calculateStp(nodes, edges)
        setRootBridge(rootBridge)
        setBlockedEdges(blocked)
        useStpStore.getState().setPortStates(portStates)

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

    const { pingNode } = usePingSimulation({
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

    const {
        onConnect,
        saveNetwork,
        loadNetwork,
        deleteSelectedNode,
        addRouter,
        addServer,
        addSwitch
    } = useNetworkActions({
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

    // animatedEdges mapping removed to fix performance issues.
    // CustomEdge now computes its own styling directly from Zustand.

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

            <div className="network-workspace" style={{ display: 'flex', height: 'calc(100vh - 120px)', marginTop: '16px', gap: '16px', overflow: 'hidden' }}>
                <div className="canvas-container" style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-dark)' }}>
                    <NetworkCanvas
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onNodeDragStop={onNodeDragStop}
                    />
                </div>

                <ControlPanelSidebar 
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
                    routingTable={routingTable}
                    alerts={alerts}
                    incidents={incidents}
                />
            </div>
        </AppLayout>
    )
}

export default NetworksPage