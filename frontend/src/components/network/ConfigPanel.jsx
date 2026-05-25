import socket from '../../websocket/socket'
import useNetworkStore from '../../stores/network.store'

export default function ConfigPanel({
    selectedNode,
    selectedEdge,
    nodes,
    setNodes,
    setEdges,
    setSelectedNode,
    setSelectedEdge,
    pingTarget,
    setPingTarget,
    pingNode,
    deleteSelectedNode,
    updateServiceStatus,
    restartService,
    deployUpdate
}) {
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)
    if (!selectedNode && !selectedEdge) return null;

    if (selectedEdge) {
        const handleEdgeUpdate = (field, value) => {
            const updatedEdge = {
                ...selectedEdge,
                data: {
                    ...selectedEdge.data,
                    [field]: field === 'status' ? value : Number(value)
                }
            }
            setSelectedEdge(updatedEdge)
            setEdges((currentEdges) => currentEdges.map(e => e.id === selectedEdge.id ? updatedEdge : e))
        }

        return (
            <div className="config-panel">
                <h3>Edge Configuration</h3>
                <p>ID: {selectedEdge.id}</p>
                <p>
                    Bandwidth (Mbps):<br/>
                    <input type="number" value={selectedEdge.data?.bandwidth || 0} onChange={e => handleEdgeUpdate('bandwidth', e.target.value)} />
                </p>
                <p>
                    Latency (ms):<br/>
                    <input type="number" value={selectedEdge.data?.latency || 0} onChange={e => handleEdgeUpdate('latency', e.target.value)} />
                </p>
                <p>
                    Packet Loss (0-1):<br/>
                    <input type="number" step="0.01" value={selectedEdge.data?.packetLoss || 0} onChange={e => handleEdgeUpdate('packetLoss', e.target.value)} />
                </p>
                <p>
                    Status:<br/>
                    <select value={selectedEdge.data?.status || 'ONLINE'} onChange={e => handleEdgeUpdate('status', e.target.value)}>
                        <option value="ONLINE">ONLINE</option>
                        <option value="OFFLINE">OFFLINE</option>
                    </select>
                </p>
                <p>Current Traffic: {selectedEdge.data?.traffic || 0}</p>
            </div>
        )
    }

    const metric = nodeMetrics[selectedNode.id] || {}

    return (
        <div className="config-panel">
            <h3>Node Configuration</h3>

            <p>Type: {selectedNode.type}</p>

            <p>
                Label: <input
                    type='text'
                    value={selectedNode.data.label}
                    onChange={(e) => {
                        const updatedLabel = e.target.value

                        setNodes((nodes) =>
                            nodes.map((node) => {
                                if (node.id === selectedNode.id) {
                                    return {
                                        ...node,
                                        data: {
                                            ...node.data,
                                            label: updatedLabel
                                        }
                                    }
                                }

                                return node
                            })
                        )

                        setSelectedNode((prev) => ({
                            ...prev,
                            data: {
                                ...prev.data,
                                label: updatedLabel
                            }
                        }))

                        socket.emit(
                            'node:updateLabel',
                            {
                                id: selectedNode.id,
                                label: updatedLabel
                            }
                        )
                    }}
                />
            </p>

            <p>
                IP Address:
                <input
                    type="text"
                    value={selectedNode.data.ip || ''}
                    onChange={(e) => {
                        const updatedIp = e.target.value

                        setNodes((nodes) =>
                            nodes.map((node) => {
                                if (node.id === selectedNode.id) {
                                    return {
                                        ...node,
                                        data: {
                                            ...node.data,
                                            ip: updatedIp
                                        }
                                    }
                                }

                                return node
                            })
                        )

                        setSelectedNode((prev) => ({
                            ...prev,
                            data: {
                                ...prev.data,
                                ip: updatedIp
                            }
                        }))
                    }}
                />
            </p>

            <p>
                Subnet:

                <input
                    type='text'
                    value={selectedNode.data.subnet || ''}
                    onChange={(e) => {
                        const updatedSubnet = e.target.value

                        setNodes((nodes) =>
                            nodes.map((node) => {
                                if (node.id.toString() === selectedNode.id.toString()) {
                                    return {
                                        ...node,
                                        data: {
                                            ...node.data,
                                            subnet: updatedSubnet
                                        }
                                    }
                                }

                                return node
                            })
                        )
                    }}
                />
            </p>

            <p>
                Gateway:

                <input
                    type='text'
                    value={selectedNode.data.gateway || ''}
                    onChange={(e) => {
                        const updatedGateway = e.target.value;

                        setNodes((nodes) =>
                            nodes.map((node) => {
                                if (node.id.toString() === selectedNode.id.toString()) {
                                    return {
                                        ...node,
                                        data: {
                                            ...node.data,
                                            gateway: updatedGateway
                                        }
                                    }
                                }

                                return node
                            })
                        )
                    }}
                />
            </p>

            {
                selectedNode.type === 'routerNode' && (
                    <>
                        <p>OS: {selectedNode.data.os}</p>
                        <p> Uptime: {metric.uptime}</p>
                    </>
                )
            }

            {
                selectedNode.type === 'serverNode' && (
                    <>
                        <p>CPU: {metric.cpu}</p>
                        <p>RAM: {metric.ram}</p>
                        <p>Storage: {metric.storage}</p>

                        <div className="services-panel">
                            <h4>Services</h4>

                            {
                                metric.services?.map((service) => (
                                    <div
                                        key={service.id}
                                        className="service-card"
                                    >
                                        <div>
                                            <strong>{service.name}</strong>
                                        </div>

                                        <div>
                                            Status: {service.status}
                                        </div>

                                        <div>
                                            CPU: {service.cpu}%
                                        </div>

                                        <div>
                                            Memory: {service.memory}%
                                        </div>

                                        <div>
                                            Port: {service.port}
                                        </div>

                                        <div className="service-actions">
                                            <button
                                                onClick={() =>
                                                    updateServiceStatus(
                                                        selectedNode.id,
                                                        service.id,
                                                        'RUNNING'
                                                    )
                                                }
                                            >
                                                Start
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateServiceStatus(
                                                        selectedNode.id,
                                                        service.id,
                                                        'FAILED'
                                                    )
                                                }
                                            >
                                                Stop
                                            </button>

                                            <button
                                                onClick={() =>
                                                    restartService(
                                                        selectedNode.id,
                                                        service.id
                                                    )
                                                }
                                            >
                                                Restart
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deployUpdate(selectedNode.id)
                                                }
                                            >
                                                Deploy Update
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </>
                )
            }

            <p>Node ID: {selectedNode.id}</p>

            <select
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
            >
                <option value=''>Select Target</option>

                {
                    nodes.filter(
                        (node) => node.id.toString() !== selectedNode.id.toString()
                    ).map((node) => (
                        <option
                            key={node.id}
                            value={node.id}
                        >
                            {node.data.label}
                        </option>
                    ))
                }
            </select>

            <button onClick={pingNode}>Ping Node</button>

            <button onClick={deleteSelectedNode}>Delete Node</button>
        </div>
    )
}
