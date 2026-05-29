import useDhcpStore from '../stores/dhcp.store'
import { DHCP_POOLS } from '../constants/dhcp.config'

function delay(ms) {
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    )
}

export async function requestDhcpLease({ node, addEvent }) {
    addEvent({
        type: 'DHCP',
        severity: 'INFO',
        message: `${node.data.label} → DHCP DISCOVER`
    })

    await delay(500)

    for (const pool of DHCP_POOLS) {
        addEvent({
            type: 'DHCP',
            severity: 'INFO',
            message: `DHCP SERVER → DHCP OFFER (${pool.network}.x)`
        })

        await delay(500)

        addEvent({
            type: 'DHCP',
            severity: 'INFO',
            message: `${node.data.label} → DHCP REQUEST`
        })

        await delay(500)

        const allocateIp = useDhcpStore.getState().allocateIp

        const lease = allocateIp(node.data.mac, pool)

        if (lease) {
            addEvent({
                type: 'DHCP',
                severity: 'SUCCESS',

                message: `DHCP SERVER → DHCP ACK (${lease.ip})`
            })

            return lease
        }
    }

    addEvent({
        type: 'DHCP',
        severity: 'ERROR',

        message: 'No DHCP addresses available'
    })

    return null
}