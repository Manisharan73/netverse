import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow'
import 'reactflow/dist/style.css'
import AppLayout from '../layouts/AppLayout'
import '../styles/networks.css'
import RouterNode from '../components/nodes/RouterNode'
import ServerNode from '../components/nodes/ServerNode'
import { createNetwork, getNetworkById, updateNetwork } from '../services/network.service'
import useNetworkStore from '../stores/network.store'
import { useState, useEffect } from 'react'
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
    },
]

function NetworksPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const [currentNetworkId, setCurrentNetworkId] = useState(null)

    const [selectedNode, setSelectedNode] = useState(null)

    function onNodeClick(event, node) {
        setSelectedNode(node)
    }

    function onConnect(connection) {
        const newEdge = {
            ...connection,
            id: `e${connection.source}-${connection.target}`
        }

        setEdges((edges) => addEdge(newEdge, edges))

        socket.emit('edge:add', newEdge)

        console.log('edge add')
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
            const network = await getNetworkById(10)

            setCurrentNetworkId(network.id)

            const formattedNodes = network.Nodes.map((node) => ({
                id: node.id.toString(),
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

                        if (
                            node.id.toString()
                            ===
                            data.id.toString()
                        ) {

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

                    if (
                        !prev
                        ||
                        prev.id.toString()
                        !==
                        data.id.toString()
                    ) {

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

    return (
        <AppLayout>

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

                        <p>Node ID: {selectedNode.id}</p>

                        <button onClick={deleteSelectedNode}>
                            Delete Node
                        </button>
                    </div>
                )
            }

            <div className="network-canvas">

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onNodeClick={onNodeClick}
                    onNodeDragStop={onNodeDragStop}
                    fitView
                >

                    <MiniMap />

                    <Controls />

                    <Background />

                </ReactFlow>

            </div>

        </AppLayout>
    )
}

export default NetworksPage