import React from 'react'
import { getBezierPath, BaseEdge, EdgeLabelRenderer } from 'reactflow'

export default function CustomEdge({
    id,
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

    const traffic = data?.traffic || 0
    const isOffline = data?.status === 'OFFLINE' || style.stroke === '#991b1b'
    const isFailed = style.stroke === '#ef4444'

    const latency = data?.latency || 10
    const duration = Math.max(0.5, (latency / 50) + Math.max(0, (100 - traffic) / 100))

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            
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
