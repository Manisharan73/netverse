function RouterNode({ data }) {
    return(
        <div className="custom-node router-node">
            <div className="node-header">
                Router
            </div>

            <div className="node-body">
                <p>{data.label}</p>

                <span className="node-ip">
                    192.168.1.1
                </span>
            </div>
        </div>
    )
}

export default RouterNode