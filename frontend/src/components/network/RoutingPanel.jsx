export default function RoutingPanel({ routingTable }) {
    return (
        <div className="routing-panel">
            <div className="routing-header">
                Routing Table
            </div>

            <div className="routing-body">
                {
                    routingTable.map((route, index) => (
                        <div
                            key={index}
                            className='route-card'
                        >
                            <p>
                                <strong>Node:</strong>
                                {route.node}
                            </p>

                            <p>
                                <strong>IP:</strong>
                                {route.ip}
                            </p>

                            <p>
                                <strong>Subnet:</strong>
                                {route.subnet}
                            </p>

                            <p>
                                <strong>Gateway:</strong>
                                {route.gateway}
                            </p>

                            <p>
                                <strong>Status:</strong>
                                {route.status}
                            </p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
