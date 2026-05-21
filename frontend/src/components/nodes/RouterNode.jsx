import { Handle, Position } from 'reactflow'

function RouterNode({ data }) {
    return(
        <div className={`custom-node router-node ${data.status?.toLowerCase()}`}>
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

                <span className={`status-dot ${data.status?.toLowerCase()}`}> </span>
            </div>

            <Handle 
                type='source'
                position={Position.Right}
            />
        </div>
    )
}

export default RouterNode