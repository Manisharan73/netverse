import React from 'react'

function SwitchNode({ data }) {
    return (
        <div className="switch-node">
            <div>
                🔀 {data.label}
            </div>

            <div>
                VLAN: {data.vlan}
            </div>

            <div>
                {data.ip || 'No IP'}
            </div>
        </div>
    )
}

export default React.memo(SwitchNode)
