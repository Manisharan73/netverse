import { Handle, Position } from 'reactflow'

function RouterNode({ data }) {
    return(
        <div className="custom-node router-node">
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
                    192.168.1.1
                </span>
            </div>

            <Handle 
                type='source'
                position={Position.Right}
            />
        </div>
    )
}

export default RouterNode