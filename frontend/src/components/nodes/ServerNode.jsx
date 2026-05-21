import { Handle, Position } from 'reactflow'

function ServerNode({ data }) {
    return (
        <div className={`custom-node server-node ${data.status?.toLowerCase()}`}>
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
                        CPU: {data.cpu}
                    </small>

                    <small>
                        RAM: {data.ram}
                    </small>
                </div>

                <span className={`status-dot ${data.status?.toLowerCase()}`}></span>
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    )
}

export default ServerNode