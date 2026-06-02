export default function NetworkToolbar({
    addRouter,
    addServer,
    addSwitch,
    onSaveClick,
    onLoadClick
}) {
    return (
        <div className="network-toolbar">
            <button onClick={addRouter}>
                Add Router
            </button>

            <button onClick={addServer}>
                Add Server
            </button>

            <button onClick={addSwitch}>
                Add Switch
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

            <button onClick={onSaveClick}>
                Save Network
            </button>

            <button onClick={onLoadClick}>
                Load Network
            </button>
        </div>
    )
}
