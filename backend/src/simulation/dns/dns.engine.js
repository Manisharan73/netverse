const DnsRecord = require('../../models/dns_record.model')

// Hardcoded public DNS for simulation fallback
const PUBLIC_DNS = {
    'www.google.com': '142.250.190.4',
    'www.github.com': '140.82.113.3',
    'www.cloudflare.com': '1.1.1.1',
    'www.aws.amazon.com': '52.94.236.248',
    'www.netflix.com': '54.237.226.164'
}

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function resolveDns(domain, networkId, io) {
    io.to(`network:${networkId}`).emit('event:created', {
        type: 'DNS',
        severity: 'INFO',
        message: `DNS QUERY ${domain}`
    })

    await delay(400) // Simulate DNS lookup time

    // 1. Check database for local network records
    const record = await DnsRecord.findOne({ where: { networkId, domain } })
    let ip = record ? record.ipAddress : null

    // 2. Check public DNS mock
    if (!ip) {
        ip = PUBLIC_DNS[domain]
    }

    if (!ip) {
        io.to(`network:${networkId}`).emit('event:created', {
            type: 'DNS',
            severity: 'ERROR',
            message: `DNS resolution failed for ${domain}`
        })
        return null
    }

    io.to(`network:${networkId}`).emit('event:created', {
        type: 'DNS',
        severity: 'SUCCESS',
        message: `${domain} resolved to ${ip}`
    })

    return ip
}

module.exports = {
    resolveDns
}
