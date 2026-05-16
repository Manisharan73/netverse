function ServerNode({ data }) {
    return(
        <div className="custom-node server-node">
            <div className="node-header">
                Server
            </div>

            <div className="node-body">
                <p>{data.label}</p>

                <span className="node-ip">
                    10.0.0.25
                </span>
            </div>
        </div>
    )
}

export default ServerNode