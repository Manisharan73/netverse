import React from 'react'
import { getBezierPath, BaseEdge, EdgeLabelRenderer } from 'reactflow'
import useNetworkStore from '../../stores/network.store'
import useStpStore from '../../stores/stp.store'

export default function CustomEdge({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
}) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    const sourceMetric = useNetworkStore((state) => state.nodeMetrics[source])
    const targetMetric = useNetworkStore((state) => state.nodeMetrics[target])
    
    const activeEdges = useNetworkStore((state) => state.activeEdges)
    const edgeStatus = useNetworkStore((state) => state.edgeStatus)
    const blockedEdges = useStpStore((state) => state.blockedEdges)

    const traffic = data?.traffic || 0
    const isActive = activeEdges.includes(id)
    const isBlocked = blockedEdges.includes(id)

    const sourceOffline = sourceMetric?.status === 'OFFLINE'
    const targetOffline = targetMetric?.status === 'OFFLINE'
    const isOffline = data?.status === 'OFFLINE' || sourceOffline || targetOffline

    let edgeColor = '#22c55e'
    let edgeWidth = Math.min(8, 2 + traffic / 25)

    if (traffic > 70) edgeColor = '#f59e0b'
    if (traffic > 120) edgeColor = '#ef4444'
    if (data?.status === 'CONGESTED') edgeColor = '#f97316'

    if (isActive) {
        edgeColor = edgeStatus === 'failed' ? '#ef4444' : '#22c55e'
        edgeWidth = 5
    }

    if (isBlocked) {
        edgeColor = '#f59e0b'
        edgeWidth = 3
    }

    if (isOffline) {
        edgeColor = '#991b1b'
        edgeWidth = 4
    }

    const dynamicStyle = {
        ...style,
        stroke: edgeColor,
        strokeWidth: edgeWidth
    }

    const isFailed = edgeColor === '#ef4444'

    const latency = data?.latency || 10
    const duration = Math.max(0.5, (latency / 50) + Math.max(0, (100 - traffic) / 100))

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={dynamicStyle} />
            
            {!isOffline && traffic > 0 && (
                <circle r="4" fill={isFailed ? "#ef4444" : "#fff"}>
                    <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={edgePath} />
                </circle>
            )}

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        background: '#1f2937',
                        padding: '4px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#d1d5db',
                        pointerEvents: 'all',
                        border: '1px solid #374151'
                    }}
                    className="nodrag nopan"
                >
                    {/* Temporarily disabled multiline labels for performance */}
                    <div>{data?.latency || 0}ms</div>
                    {/* <div>BW: {data?.bandwidth || 0}Mbps</div>
                    <div>LAT: {data?.latency || 0}ms</div>
                    <div>LOSS: {Math.floor((data?.packetLoss || 0) * 100)}%</div>
                    <div style={{ color: isOffline ? '#ef4444' : '#22c55e', marginTop: '2px', fontWeight: 'bold' }}>
                        {data?.status || 'ONLINE'}
                    </div> */}
                </div>
            </EdgeLabelRenderer>
        </>
    )
}
