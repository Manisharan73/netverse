import React from 'react'
import { Handle, Position } from 'reactflow'
import useNetworkStore from '../../stores/network.store'

function SwitchNode({ id, data }) {
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)
    const metric = nodeMetrics[id] || {}

    return (
        <div className={`custom-node switch-node ${metric.status?.toLowerCase() || 'online'}`}>
            <Handle 
                type='target'
                position={Position.Left}
            />

            <div className="node-header" style={{ background: '#f59e0b' }}>
                Switch
            </div>

            <div className="node-body">
                <p>{data.label}</p>

                <span className="node-ip">
                    {data.ip || 'No IP'}
                </span>

                <div>
                    VLAN: {data.vlan}
                </div>

                <span className={`status-dot ${metric.status?.toLowerCase() || 'online'}`}> </span>
            </div>

            <Handle 
                type='source'
                position={Position.Right}
            />
        </div>
    )
}

export default React.memo(SwitchNode)
