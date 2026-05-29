import useDnsStore from '../stores/dns.store'
import { PUBLIC_DNS } from '../constants/internet.config'

function delay(ms) {
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    )
}

export async function resolveDns({ domain, addEvent }) {
    addEvent({
        type: 'DNS',
        severity: 'INFO',

        message: `DNS QUERY ${domain}`
    })

    await delay(400)

    const localIp = useDnsStore.getState().resolveDomain(domain)
    const publicIp = PUBLIC_DNS[domain]
    const ip = localIp || publicIp

    if (!ip) {
        addEvent({
            type: 'DNS',
            severity: 'ERROR',

            message: `DNS resolution failed for ${domain}`
        })

        return null
    }

    addEvent({
        type: 'DNS',
        severity: 'SUCCESS',

        message: `${domain} resolved to ${ip}`
    })

    return ip
}