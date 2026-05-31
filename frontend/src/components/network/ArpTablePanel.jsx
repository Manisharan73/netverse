import React from 'react'
import useArpStore from '../../stores/arp.store'

function ArpTablePanel() {
    const arpTable = useArpStore((state) => state.arpTable)

    return (
        <div className="arp-table-panel panel-dark">
            <h3>ARP Cache Tables</h3>
            {Object.keys(arpTable).length === 0 && <p className="empty-text">No ARP entries found.</p>}
            {Object.entries(arpTable).map(([nodeId, entries]) => (
                <div key={nodeId} className="table-section">
                    <h4>Node: {nodeId}</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>IP Address</th>
                                <th>MAC Address</th>
                                <th>Age (s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(entries).map(([ip, data]) => (
                                <tr key={ip}>
                                    <td>{ip}</td>
                                    <td>{data.mac}</td>
                                    <td>{Math.floor((Date.now() - data.learnedAt) / 1000)}s</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    )
}

export default React.memo(ArpTablePanel)
