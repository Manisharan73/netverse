import React from 'react'
import { ReactFlow, MiniMap, Controls, Background } from 'reactflow'
import CustomEdge from './CustomEdge'
import PacketLayer from './PacketLayer'

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
                onlyRenderVisibleElements
            >

                <Controls />
            </ReactFlow>

            <div className="packet-layer-wrapper">
                <PacketLayer nodes={nodes} />
            </div>
        </div>
    )
})

export default NetworkCanvas
