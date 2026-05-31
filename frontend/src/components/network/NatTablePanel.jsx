import React from 'react'
import useNatStore from '../../stores/nat.store'

function NatTablePanel() {
    const translations = useNatStore((state) => state.translations)

    return (
        <div className="nat-table-panel panel-dark">
            <h3>NAT / PAT Translation Table</h3>
            {Object.keys(translations).length === 0 && <p className="empty-text">No active translations.</p>}
            {Object.keys(translations).length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Private IP:Port</th>
                            <th>Public IP:Port</th>
                            <th>Type</th>
                            <th>Age (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(translations).map(([key, entry]) => (
                            <tr key={key}>
                                <td>{entry.privateIp}:{entry.privatePort || '*'}</td>
                                <td>{entry.publicIp}:{entry.publicPort || '*'}</td>
                                <td>{entry.type}</td>
                                <td>{Math.floor((Date.now() - entry.createdAt) / 1000)}s</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default React.memo(NatTablePanel)
