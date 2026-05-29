import '../../styles/link-config-panel.css'

function LinkConfigPanel({
    selectedEdge,
    setEdges
}) {
    if (!selectedEdge) {
        return null
    }

    function updateEdgeData(field, value) {
        setEdges((edges) =>
            edges.map((edge) => {
                if (edge.id !== selectedEdge.id) {
                    return edge
                }

                return {
                    ...edge,

                    data: {
                        ...edge.data,
                        [field]: value
                    }
                }
            })
        )
    }

    return (
        <div className="link-config-panel">
            <h3>Link Configuration</h3>

            <label>
                Bandwidth (Mbps)
            </label>

            <input
                type="number"
                value={selectedEdge.data?.bandwidth || 100}
                onChange={(e) =>
                    updateEdgeData(
                        'bandwidth',
                        Number(e.target.value)
                    )
                }
            />

            <label>
                Latency (ms)
            </label>

            <input
                type="number"
                value={selectedEdge.data?.latency || 10}
                onChange={(e) =>
                    updateEdgeData(
                        'latency',
                        Number(e.target.value)
                    )
                }
            />

            <label>
                Packet Loss
            </label>

            <input
                type="number"
                step="0.01"
                value={selectedEdge.data?.packetLoss || 0}
                onChange={(e) =>
                    updateEdgeData(
                        'packetLoss',
                        Number(e.target.value)
                    )
                }
            />

            <label>
                Status
            </label>

            <select
                value={selectedEdge.data?.status || 'ONLINE'}
                onChange={(e) =>
                    updateEdgeData(
                        'status',
                        e.target.value
                    )
                }
            >
                <option value="ONLINE">
                    ONLINE
                </option>

                <option value="OFFLINE">
                    OFFLINE
                </option>

                <option value="CONGESTED">
                    CONGESTED
                </option>
            </select>
        </div>
    )
}

export default LinkConfigPanel
