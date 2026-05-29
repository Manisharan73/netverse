import React from 'react'
import useSwitchStore from '../../stores/switch.store'

function MacTablePanel() {
    const macTable = useSwitchStore((state) => state.macTable)

    return (
        <div className="mac-table-panel">
            <h3>MAC Address Tables</h3>

            {
                Object.entries(macTable).map(
                    ([switchId, entries]) => (
                        <div
                            key={switchId}
                            className="mac-table-switch"
                        >
                            <h4>{switchId}</h4>

                            <table>
                                <thead>
                                    <tr>
                                        <th>MAC</th>
                                        <th>Port</th>
                                        <th>VLAN</th>
                                        <th>Age</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        Object.entries(entries).map(
                                            ([mac, data]) => (
                                                <tr key={mac}>
                                                    <td>{mac}</td>

                                                    <td>
                                                        {data.port}
                                                    </td>

                                                    <td>
                                                        {data.vlan}
                                                    </td>

                                                    <td>
                                                        {
                                                            Math.floor((Date.now() - data.learnedAt) / 1000)
                                                        }s
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    )
                )
            }
        </div>
    )
}

export default React.memo(MacTablePanel)