import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow'
import 'reactflow/dist/style.css'
import AppLayout from '../layouts/AppLayout'
import '../styles/networks.css'
import RouterNode from '../components/nodes/RouterNode'
import ServerNode from '../components/nodes/ServerNode'
import { createNetwork, getNetworkById, updateNetwork } from '../services/network.service'
import useNetworkStore from '../stores/network.store'
import { useState, useEffect, useRef } from 'react'
import socket from '../websocket/socket'

const nodeTypes = {
    routerNode: RouterNode,
    serverNode: ServerNode,
}

const initialNodes = [
    {
        id: '1',

        position: {
            x: 100,
            y: 100,
        },

        data: {
            label: 'Main Router',
        },

        type: 'routerNode',
    },

    {
        id: '2',

        position: {
            x: 400,
            y: 200,
        },

        data: {
            label: 'Web Server',
        },

        type: 'serverNode',
    },
]

const initialEdges = [
    {
        id: 'e1-2',

        source: '1',
        target: '2',

        animated: true
    },
]

function NetworksPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const [currentNetworkId, setCurrentNetworkId] = useState(null)
    const [selectedNode, setSelectedNode] = useState(null)
    const [saveStatus, setSaveStatus] = useState('Saved')
    const [logs, setLogs] = useState([])
    const [pingTarget, setPingTarget] = useState('')
    const [activeEdges, setActiveEdges] = useState([])
    const [edgeStatus, setEdgeStatus] = useState('success')
    const [routingTable, setRoutingTable] = useState([])

    const terminalRef = useRef(null)

    function onNodeClick(event, node) {
        setSelectedNode(node)
    }

    function onConnect(connection) {
        const newEdge = {
            ...connection,
            id: `e${connection.source}-${connection.target}`,
            animated: true
        }

        setEdges((edges) => addEdge(newEdge, edges))

        socket.emit('edge:add', newEdge)

    }

    const setCurrentNetwork = useNetworkStore((state) => state.setCurrentNetwork)

    async function saveNetwork() {
        try {
            const networkData = {
                name: 'My Infrastructure',
                description: 'NetVerse Topology',
                nodes,
                edges
            }

            if (currentNetworkId) {
                await updateNetwork(
                    currentNetworkId,
                    networkData
                )

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
        const newNode = {
            id: `${Date.now()}`,

            position: {
                x: Math.random() * 400,
                y: Math.random() * 400,
            },

            data: {
                label: 'Router',
                status: 'ONLINE',
                ip: '192.168.1.1',
                os: 'Cisco IOS',
                uptime: '12 days',
                subnet: '192.168.1.0/24',
                gateway: '192.168.1.1'
            },

            type: 'routerNode',
        }

        setNodes((nodes) => [
            ...nodes,
            newNode
        ])

        socket.emit('node:add', newNode)
    }

    function addServer() {
        const newNode = {
            id: `${Date.now()}`,

            position: {
                x: Math.random() * 400,
                y: Math.random() * 400,
            },

            data: {
                label: 'Server',
                status: 'ONLINE',
                ip: '10.0.0.25',
                cpu: '32%',
                ram: '58%',
                storage: '71%',
                subnet: '10.0.0.0/24',
                gateway: '10.0.0.1'
            },

            type: 'serverNode',
        }

        setNodes((nodes) => [
            ...nodes,
            newNode
        ])

        socket.emit('node:add', newNode)
    }

    async function loadNetwork() {
        try {
            const network = await getNetworkById(3)

            setCurrentNetworkId(network.id)

            const formattedNodes = network.Nodes.map((node) => ({
                id: node.frontendId.toString(),
                type: node.type || 'default',
                position: {
                    x: Number(node.posX) || 0,
                    y: Number(node.posY) || 0,
                },
                data: {
                    label: node.label || 'Node',
                }
            }))

            const formattedEdges = network.Edges.map((edge) => ({
                id: edge.id.toString(),
                source: edge.sourceNodeId.toString(),
                target: edge.targetNodeId.toString(),
                animated: true
            }))



            setNodes(formattedNodes)
            setEdges(formattedEdges)
        } catch (err) {
            console.error(err)
            alert('Failed to load network!')
        }
    }

    function deleteSelectedNode() {
        if (!selectedNode) {
            return
        }

        setEdges((edges) =>
            edges.filter((edge) => {

                return (

                    edge.source.toString() !==
                    selectedNode.id.toString()

                    &&

                    edge.target.toString() !==
                    selectedNode.id.toString()
                )
            })
        )

        setNodes((nodes) =>
            nodes.filter((node) =>

                node.id.toString() !==
                selectedNode.id.toString()
            )
        )

        socket.emit('node:delete', { id: selectedNode.id })

        setSelectedNode(null)
    }

    function findPath(startId, targetId) {
        const adjacency = {}

        edges.forEach((edge) => {
            if (!adjacency[edge.source]) {
                adjacency[edge.source] = []
            }

            if (!adjacency[edge.target]) {
                adjacency[edge.target] = []
            }

            adjacency[edge.source].push(edge.target)
            adjacency[edge.target].push(edge.source)
        })

        const queue = [[startId]]

        const visited = new Set()

        while (queue.length > 0) {
            const path = queue.shift()
            const node = path[path.length - 1]

            if (node === targetId) {
                return path
            }

            if (!visited.has(node)) {
                visited.add(node)

                const neighbors = adjacency[node] || []

                for (const neighbor of neighbors) {
                    queue.push([...path, neighbor])
                }
            }
        }

        return null
    }

    function isValidIp(ip) {
        const regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

        return regex.test(ip);
    }

    function getSubnet(ip) {
        return ip.split('.').slice(0, 3).join('.')
    }

    function pingNode() {
        if (!selectedNode || !pingTarget) {
            return
        }

        const targetNode = nodes.find((node) => node.id.toString() === pingTarget.toString())

        if (!targetNode) {
            return
        }

        if(!isValidIp(selectedNode.data.ip) || !isValidIp(targetNode.data.ip)) {
            const timeStamp = new Date().toLocaleTimeString()

            setLogs((prev) => [
                `[${timeStamp}] Invalid IP configuration`,
                ...prev
            ])

            return
        }

        const path = findPath(
            selectedNode.id,
            targetNode.id
        )

        if (!path) {
            const timestamp = new Date().toLocaleTimeString()

            setLogs((prev) => [
                `[${timestamp}] Destination unreachable`,
                ...prev
            ])

            return
        }

        const containsRouter = path.some((nodeId) => {
            const node = nodes.find((n) => n.id.toString() === nodeId.toString())

            return node?.type === 'routerNode'
        })

        const sourceSubnet = getSubnet(selectedNode.data.ip)
        const targetSubnet = getSubnet(targetNode.data.ip)

        const sameSubnet = sourceSubnet === targetSubnet

        if(!sameSubnet && !containsRouter) {
            const timeStamp = new Date().toLocaleTimeString()

            setLogs((prev) => [
                `[${timeStamp}] No router available for cross-network routing`,
                ...prev
            ])

            return
        }

        const traversedEdges = []

        for (let i = 0; i < path.length - 1; i++) {
            const source = path[i]

            const target = path[i + 1]

            const edge = edges.find(
                (edge) =>
                    (
                        edge.source.toString() === source.toString()
                        &&
                        edge.target.toString() === target.toString()
                    )

                    ||

                    (
                        edge.source.toString() === target.toString()
                        &&
                        edge.target.toString() === source.toString()
                    )
            )

            if (edge) {
                traversedEdges.push(edge.id)
            }
        }

        let latency = 0

        for (const nodeId of path) {
            const currentNode = nodes.find((node) => node.id.toString() === nodeId.toString())

            if (!currentNode) {
                continue
            }

            latency += 10 + Math.floor(Math.random() * 40)

            if (currentNode.data.status === 'WARNING') {
                latency += 150
            }

            if (currentNode.data.status === 'OFFLINE') {
                const timeStamp = new Date().toLocaleTimeString()

                setLogs((prev) => [
                    `[${timeStamp}] Route failed. Node ${currentNode.data.label} is OFFLINE`,
                    ...prev
                ])

                return
            }
        }

        setActiveEdges(traversedEdges)
        setTimeout(() => {
            setActiveEdges([])
        }, latency + 500)

        const failed = targetNode.data.status === 'OFFLINE'

        const packetLoss = Math.random() < 0.2

        const timeStamp = new Date().toLocaleTimeString()

        let log = ''

        if (failed || packetLoss) {
            log = `[${timeStamp}] Request timed out for ${targetNode.data.ip}`
            setEdgeStatus('failed')
        } else {
            log = `[${timeStamp}] Route: ${path.join(' → ')} Network: ${sameSubnet ? 'Local Network' : 'Cross Network Routing'} Reply from ${targetNode.data.ip} time=${latency}ms`
            setEdgeStatus('success')
        }

        setLogs((prev) => [
            log,
            ...prev
        ])
    }

    function onNodeDragStop(event, node) {
        socket.emit(
            'node:move',
            {
                id: node.id,
                position: {
                    x: node.position.x,
                    y: node.position.y
                }
            }
        )

        console.log('Emitted')
    }

    const routerCount = nodes.filter(
        (node) => node.type === 'routerNode'
    ).length

    const serverCount = nodes.filter(
        (node) => node.type === 'serverNode'
    ).length

    const onlineCount = nodes.filter(
        (node) => node.data.status === 'ONLINE'
    ).length

    const offlineCount = nodes.filter(
        (node) => node.data.status === 'OFFLINE'
    ).length

    const warningCount = nodes.filter(
        (node) => node.data.status === 'WARNING'
    ).length

    const connectionCount = edges.length

    const healthScore = Math.max(0, 100 - (offlineCount * 25 + warningCount * 10))

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected: ', socket.id)
        })

        socket.on('node:added', (node) => {
            setNodes((nodes) => [
                ...nodes,
                node
            ])
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
        }
        )

        socket.on('edge:added', (edge) => {
            setEdges((edges) => addEdge(edge, edges))
        })

        socket.on('node:deleted', (data) => {
            setEdges((edges) =>
                edges.filter((edge) =>
                    edge.source.toString() !== data.id.toString
                    &&
                    edge.target.toString() !== data.id.toString()
                )
            )

            setNodes((nodes) =>
                nodes.filter((node) => node.id.toString() !== data.id.toString())
            )
        })

        socket.on(
            'node:labelUpdated',
            (data) => {
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
            }
        )

        return () => {
            socket.off('connect')
            socket.off('node:added')
            socket.off('node:moved')
            socket.off('edge:added')
            socket.off('node:deleted')
            socket.off('node:updatedLabel')
        }
    }, [])

    useEffect(() => {
        if (!currentNetworkId) {
            return
        }

        setSaveStatus('Saving...')

        const timeOut = setTimeout(async () => {
            try {
                await updateNetwork(
                    currentNetworkId,
                    {
                        name: 'My Infrastructure',
                        description: 'NetVerse Topology',
                        nodes,
                        edges
                    }
                )

                setSaveStatus('Saved')
            } catch (err) {
                console.error(err)
                setSaveStatus('Error')
            }
        }, 1500)

        return () => clearTimeout(timeOut)
    }, [nodes, edges])

    useEffect(() => {
        const interval = setInterval(() => {
            setNodes((currentNodes) =>
                currentNodes.map((node) => {
                    if (node.type !== 'serverNode') {
                        return node
                    }

                    const cpu = Math.floor(Math.random() * 100)
                    const ram = Math.floor(Math.random() * 100)
                    const storage = Math.floor(Math.random() * 100)
                    let status = 'ONLINE'

                    if (cpu > 85 || ram > 90) {
                        status = 'WARNING'
                    }

                    if (cpu > 95) {
                        status = 'OFFLINE'
                    }

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            cpu: `${cpu}%`,
                            ram: `${ram}%`,
                            storage: `${storage}%`,
                            status
                        }
                    }
                })
            )
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!selectedNode) {
            return
        }

        const updatedNode = nodes.find((node) => node.id.toString() === selectedNode.id.toString())

        if (updatedNode) {
            setSelectedNode(updatedNode)
        }
    }, [nodes])

    const animatedEdges = edges.map((edge) => {
        if (activeEdges.includes(edge.id)) {
            return {
                ...edge,
                animated: true,
                style: {
                    stroke: edgeStatus === 'failed' ? '#ef4444' : '#22c55e',
                    strokeWidth: 4
                }
            }
        }

        return {
            ...edge,
            animated: true,
            style: {
                stroke: '#64748b',
                strokeWidth: 2
            }
        }
    })

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = 0
        }
    })

    useEffect(() => {
        const routes = []

        nodes.forEach((node) => {
            routes.push({
                node: node.data.label,
                ip: node.data.ip,
                subnet: node.data.subnet,
                gateway: node.data.gateway,
                status: node.data.status
            })
        })

        setRoutingTable(routes)
    }, [nodes])

    return (
        <AppLayout saveStatus={saveStatus}>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{routerCount}</h3>
                    <p>Routers</p>
                </div>

                <div className="stat-card">
                    <h3>{serverCount}</h3>
                    <p>Servers</p>
                </div>

                <div className="stat-card">
                    <h3>{connectionCount}</h3>
                    <p>Connections</p>
                </div>

                <div className="stat-card">
                    <h3>{onlineCount}</h3>
                    <p>Online</p>
                </div>

                <div className="stat-card">
                    <h3>{offlineCount}</h3>
                    <p>Offline</p>
                </div>

                <div className="stat-card">
                    <h3>{warningCount}</h3>
                    <p>Warning</p>
                </div>

                <div className="stat-card">
                    <h3>{healthScore}</h3>
                    <p>Network Health</p>
                </div>
            </div>

            <div className="network-toolbar">

                <button onClick={addRouter}>
                    Add Router
                </button>

                <button onClick={addServer}>
                    Add Server
                </button>

                <button onClick={saveNetwork}>
                    Save Network
                </button>

                <button onClick={loadNetwork}>
                    Load Network
                </button>

            </div>

            {
                selectedNode && (
                    <div className="config-panel">
                        <h3>Node Configuration</h3>

                        <p>Type: {selectedNode.type}</p>

                        <p>
                            Label: <input
                                type='text'
                                value={selectedNode.data.label}
                                onChange={(e) => {
                                    const updatedLabel = e.target.value

                                    setNodes((nodes) =>
                                        nodes.map((node) => {
                                            if (node.id === selectedNode.id) {
                                                return {
                                                    ...node,
                                                    data: {
                                                        ...node.data,
                                                        label: updatedLabel
                                                    }
                                                }
                                            }

                                            return node
                                        })
                                    )

                                    setSelectedNode((prev) => ({
                                        ...prev,
                                        data: {
                                            ...prev.data,
                                            label: updatedLabel
                                        }
                                    }))

                                    socket.emit(
                                        'node:updateLabel',
                                        {
                                            id: selectedNode.id,
                                            label: updatedLabel
                                        }
                                    )
                                }}
                            />
                        </p>

                        <p>
                            IP Address:
                            <input
                                type="text"
                                value={selectedNode.data.ip || ''}
                                onChange={(e) => {
                                    const updatedIp = e.target.value

                                    setNodes((nodes) =>
                                        nodes.map((node) => {
                                            if (node.id === selectedNode.id) {
                                                return {
                                                    ...node,
                                                    data: {
                                                        ...node.data,
                                                        ip: updatedIp
                                                    }
                                                }
                                            }

                                            return node
                                        })
                                    )

                                    setSelectedNode((prev) => ({
                                        ...prev,
                                        data: {
                                            ...prev.data,
                                            ip: updatedIp
                                        }
                                    }))
                                }}
                            />
                        </p>

                        <p>
                            Subnet:

                            <input
                                type='text'
                                value={selectedNode.data.subnet || ''}
                                onChange={(e) => {
                                    const updatedSubnet = e.target.value

                                    setNodes((nodes) =>
                                        nodes.map((node) => {
                                            if (node.id.toString() === selectedNode.id.toString()) {
                                                return {
                                                    ...node,
                                                    data: {
                                                        ...node.data,
                                                        subnet: updatedSubnet
                                                    }
                                                }
                                            }

                                            return node
                                        })
                                    )
                                }}
                            />
                        </p>

                        <p>
                            Gateway:

                            <input
                                type='text'
                                value={selectedNode.data.gateway || ''}
                                onChange={(e) => {
                                    const updatedGateway = e.target.value;

                                    setNodes((nodes) =>
                                        nodes.map((node) => {
                                            if (node.id.toString() === selectedNode.id.toString) {
                                                return {
                                                    ...node,
                                                    data: {
                                                        ...node.data,
                                                        gateway: updatedGateway
                                                    }
                                                }
                                            }

                                            return node
                                        })
                                    )
                                }}
                            />
                        </p>

                        {
                            selectedNode.type === 'routerNode' && (
                                <>
                                    <p>OS: {selectedNode.data.os}</p>
                                    <p> Uptime: {selectedNode.data.uptime}</p>
                                </>
                            )
                        }

                        {
                            selectedNode.type === 'serverNode' && (
                                <>
                                    <p>CPU: {selectedNode.data.cpu}</p>
                                    <p>RAM: {selectedNode.data.ram}</p>
                                    <p>Storage: {selectedNode.data.storage}</p>
                                </>
                            )
                        }

                        <p>Node ID: {selectedNode.id}</p>

                        <select
                            value={pingTarget}
                            onChange={(e) => setPingTarget(e.target.value)}
                        >
                            <option value=''>Select Target</option>

                            {
                                nodes.filter(
                                    (node) => node.id.toString() !== selectedNode.id.toString()
                                ).map((node) => (
                                    <option
                                        key={node.id}
                                        value={node.id}
                                    >
                                        {node.data.label}
                                    </option>
                                ))
                            }
                        </select>

                        <button onClick={pingNode}>Ping Node</button>

                        <button onClick={deleteSelectedNode}>Delete Node</button>
                    </div>
                )
            }

            <div className="network-canvas">

                <ReactFlow
                    nodes={nodes}
                    edges={animatedEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onNodeClick={onNodeClick}
                    onNodeDragStop={onNodeDragStop}
                    fitView
                >

                    <MiniMap
                        nodeColor={(node) => {
                            switch (node.type) {
                                case 'routerNode': return '#2563eb'

                                case 'serverNode': return '#16a34a'

                                default: return '#6b7280'
                            }
                        }}
                    />

                    <Controls />

                    <Background />

                </ReactFlow>

            </div>

            <div className="terminal-panel">
                <div className="terminal-header">
                    Network Terminal
                </div>

                <div className="terminal-body" ref={terminalRef}>
                    {
                        logs.map((log, index) => (
                            <div
                                key={index}
                                className={`terminal-line ${log.includes('timed out') ? 'terminal-error' : 'terminal-success'}`}
                            >
                                {log}
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className="routing-panel">
                    <div className="routing-header">
                        Routing Table
                    </div>

                    <div className="routing-body">
                        {
                            routingTable.map((route, index) => (
                                <div
                                    key={index}
                                    className='route-card'
                                >
                                    <p>
                                        <strong>Node:</strong>
                                        {route.node}
                                    </p>

                                    <p>
                                        <strong>IP:</strong>
                                        {route.ip}
                                    </p>

                                    <p>
                                        <strong>Subnet:</strong>
                                        {route.subnet}
                                    </p>

                                    <p>
                                        <strong>Gateway:</strong>
                                        {route.gateway}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>
                                        {route.status}
                                    </p>
                                </div>
                            ))
                        }
                    </div>
            </div>
        </AppLayout>
    )
}

export default NetworksPage