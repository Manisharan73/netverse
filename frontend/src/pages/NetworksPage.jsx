import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow'
import 'reactflow/dist/style.css'
import AppLayout from '../layouts/AppLayout'
import '../styles/networks.css'
import RouterNode from '../components/nodes/RouterNode'
import ServerNode from '../components/nodes/ServerNode'

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

    function onConnect(connection) {
        setEdges((edges) =>
            addEdge(connection, edges)
        )
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

            type: 'default',
        }

        setNodes((nodes) => [
            ...nodes,
            newNode
        ])
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

            type: 'default',
        }

        setNodes((nodes) => [
            ...nodes,
            newNode
        ])
    }

    return (
        <AppLayout>

            <div className="network-toolbar">

                <button onClick={addRouter}>
                    Add Router
                </button>

                <button onClick={addServer}>
                    Add Server
                </button>

            </div>

            <div className="network-canvas">

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
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