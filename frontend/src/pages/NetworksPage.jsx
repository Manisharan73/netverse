import { useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import AppLayout from '../layouts/AppLayout'
import RouterNode from '../components/nodes/RouterNode'
import ServerNode from '../components/nodes/ServerNode'
import SwitchNode from '../components/nodes/SwitchNode'
import { createNetwork, getNetworkById, updateNetwork } from '../services/network.service'
import useNetworkStore from '../stores/network.store'
import { useState, useEffect, useMemo, useCallback } from 'react'
import socket from '../websocket/socket'
import useAlertStore from '../stores/alert.store'

import { INITIAL_NODES, INITIAL_EDGES, DEFAULT_ROUTER_DATA, DEFAULT_ROUTER_METRICS, DEFAULT_SERVER_DATA, DEFAULT_SERVER_METRICS } from '../constants/networkDefaults'

import useNetworkSocket from '../hooks/useNetworkSocket'
import usePingSimulation from '../hooks/usePingSimulation'
import useAutoSave from '../hooks/useAutoSave'
import useNetworkStats from '../hooks/useNetworkStats'
import useRoutingTable from '../hooks/useRoutingTable'
import usePacketLifecycle from '../hooks/usePacketLifecycle'
import useNetworkActions from '../hooks/useNetworkActions'
import useRoutingEngine from '../hooks/useRoutingEngine'

import NetworkCanvas from '../components/network/NetworkCanvas'
import NetworkToolbar from '../components/network/NetworkToolbar'
import NetworkStats from '../components/network/NetworkStats'
import ControlPanelSidebar from '../components/network/ControlPanelSidebar'
import SaveNetworkModal from '../components/network/SaveNetworkModal'
import LoadNetworkModal from '../components/network/LoadNetworkModal'

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
    const [pingTarget, setPingTarget] = useState('')
    const alerts = useAlertStore(state => state.alerts)
    const incidents = useAlertStore(state => state.incidents)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false)

    const setCurrentNetwork = useNetworkStore((state) => state.setCurrentNetwork)
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)
    const setNodeMetrics = useNetworkStore((state) => state.setNodeMetrics)
    const updateNodeMetricById = useNetworkStore((state) => state.updateNodeMetricById)

    useNetworkSocket({ setNodes, setEdges, setSelectedNode })

    usePacketLifecycle()

    const { graph, getRoute, getRouteLatency } = useRoutingEngine(nodes, edges)

    const { pingNode } = usePingSimulation({
        nodes,
        edges,
        setEdges,
        getRoute,
        getRouteLatency,
        selectedNode,
        pingTarget
    })

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
        const networkId = useNetworkStore.getState().currentNetwork?.id
        if (!networkId) return

        let action = 'start'
        if (newStatus === 'STOPPED') action = 'stop'
        if (newStatus === 'RESTARTING') action = 'restart'

        socket.emit('service:action', { networkId, nodeId, serviceId, action })
    }, [])

    const restartService = useCallback((nodeId, serviceId) => {
        const networkId = useNetworkStore.getState().currentNetwork?.id
        if (!networkId) return
        socket.emit('service:action', { networkId, nodeId, serviceId, action: 'restart' })
    }, [])

    const deployUpdate = useCallback((nodeId) => {
        const networkId = useNetworkStore.getState().currentNetwork?.id
        if (!networkId) return
        socket.emit('service:action', { networkId, nodeId, serviceId: 1, action: 'restart' })
        socket.emit('service:action', { networkId, nodeId, serviceId: 2, action: 'restart' })
    }, [])

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
                onSaveClick={() => setIsSaveModalOpen(true)}
                onLoadClick={() => setIsLoadModalOpen(true)}
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

            <SaveNetworkModal 
                isOpen={isSaveModalOpen} 
                onClose={() => setIsSaveModalOpen(false)} 
                onSave={saveNetwork} 
                initialName={useNetworkStore.getState().currentNetwork?.name} 
                initialDescription={useNetworkStore.getState().currentNetwork?.description} 
            />

            <LoadNetworkModal 
                isOpen={isLoadModalOpen} 
                onClose={() => setIsLoadModalOpen(false)} 
                onLoad={loadNetwork} 
            />
        </AppLayout>
    )
}

export default NetworksPage