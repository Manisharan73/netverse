import { Handle, Position } from 'reactflow'
import useNetworkStore from '../../stores/network.store'

function RouterNode({ id, data }) {
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)
    const metric = nodeMetrics[id] || {}

    return(
        <div className={`custom-node router-node ${metric.status?.toLowerCase() || 'online'}`}>
            <Handle 
                type='target'
                position={Position.Left}
            />

            <div className="node-header">
                Router
            </div>

            <div className="node-body">
                <p>{data.label}</p>

                <span className="node-ip">
                    {data.ip}
                </span>

                <span className={`status-dot ${metric.status?.toLowerCase() || 'online'}`}> </span>
            </div>

            <Handle 
                type='source'
                position={Position.Right}
            />
        </div>
    )
}

export default RouterNode