const serverTemplate = require('./server.template')
const routerTemplate = require('./router.template')
const switchTemplate = require('./switch.template')
const dnsTemplate = require('./dns.template')
const dhcpTemplate = require('./dhcp.template')
const clientTemplate = require('./client.template')

function getTemplate(node) {
    switch(node.type) {
        case 'SERVER':
            return serverTemplate(node)

        case 'ROUTER':
            return routerTemplate(node)

        case 'SWITCH':
            return switchTemplate(node)

        case 'DNS':
            return dnsTemplate(node)

        case 'DHCP':
            return dhcpTemplate(node)

        case 'CLIENT':
        case 'HOST':
            return clientTemplate(node)
            
        default:
            return serverTemplate(node)
    }
}

module.exports = {
    getTemplate
}
