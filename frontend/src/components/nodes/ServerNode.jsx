import { Handle, Position } from 'reactflow'

function ServerNode({ data }) {
    return(
        <div className="custom-node server-node">
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
                    10.0.0.25
                </span>
            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    )
}

export default ServerNode