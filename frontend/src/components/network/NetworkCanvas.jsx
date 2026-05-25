import React from 'react'
import { ReactFlow, MiniMap, Controls, Background } from 'reactflow'
import CustomEdge from './CustomEdge'

const edgeTypes = {
    custom: CustomEdge
}

const NetworkCanvas = React.memo(function NetworkCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    nodeTypes,
    onNodeClick,
    onNodeDragStop,
    onEdgeClick
}) {
    return (
        <div className="network-canvas">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
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
    )
})

export default NetworkCanvas
