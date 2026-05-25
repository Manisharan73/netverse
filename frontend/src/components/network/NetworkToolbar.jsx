export default function NetworkToolbar({
    addRouter,
    addServer,
    saveNetwork,
    loadNetwork
}) {
    return (
        <div className="network-toolbar">
            <button onClick={addRouter}>
                Add Router
            </button>

            <button onClick={addServer}>
                Add Server
            </button>

            <button
                onClick={() => {
                    const node = createNodeFromTemplate(
                        DEVICE_TEMPLATES.DATABASE_SERVER
                    )

                    setNodes((nodes) => [...nodes, node])

                    socket.emit('node:add', node)
                }}
            >
                Add Database
            </button>

            <button
                onClick={() => {
                    const node = createNodeFromTemplate(
                        DEVICE_TEMPLATES.FIREWALL
                    )

                    setNodes((nodes) => [...nodes, node])

                    socket.emit('node:add', node)
                }}
            >
                Add Firewall
            </button>

            <button onClick={saveNetwork}>
                Save Network
            </button>

            <button onClick={loadNetwork}>
                Load Network
            </button>
        </div>
    )
}
