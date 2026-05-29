import useArpStore from '../stores/arp.store'
import useDhcpStore from '../stores/dhcp.store'
import useDnsStore from '../stores/dns.store'
import useFirewallStore from '../stores/firewall.store'
import useNatStore from '../stores/nat.store'
import useSwitchStore from '../stores/switch.store'
import useEventStore from '../stores/event.store'

export function exportSimulationState() {
    return {
        arp: useArpStore.getState(),
        dhcp: useDhcpStore.getState(),
        dns: useDnsStore.getState(),
        firewall: useFirewallStore.getState(),
        nat: useNatStore.getState(),
        switches: useSwitchStore.getState(),
        events: useEventStore.getState()
    }
}

export function importSimulationState({ simulation }) {
    if (!simulation) {
        return
    }

    useArpStore.setState(simulation.arp)
    useDhcpStore.setState(simulation.dhcp)
    useDnsStore.setState(simulation.dns)
    useFirewallStore.setState(simulation.firewall)
    useNatStore.setState(simulation.nat)
    useSwitchStore.setState(simulation.switches)
    useEventStore.setState(simulation.events)
}
