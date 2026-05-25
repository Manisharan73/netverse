import { Handle, Position } from 'reactflow'
import useNetworkStore from '../../stores/network.store'

function ServerNode({ id, data }) {
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)
    const metric = nodeMetrics[id] || {}

    return (
        <div className={`custom-node server-node ${metric.status?.toLowerCase() || 'online'}`}>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className="node-header">
                Server
            </div>

            <div className="node-body">
                <p>{data.label}</p>

                <span className="node-ip">
                    {data.ip}
                </span>

                <div className="server-metrics">
                    <small>
                        CPU: {metric.cpu || '0%'}
                    </small>

                    <small>
                        RAM: {metric.ram || '0%'}
                    </small>
                </div>

                <span className={`status-dot ${metric.status?.toLowerCase() || 'online'}`}></span>
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    )
}

export default ServerNode