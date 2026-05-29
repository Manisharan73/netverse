import { create } from 'zustand'

const useDhcpStore = create((set, get) => ({
    leases: {},

    allocateIp: (mac, config) => {
        const leases = get().lease

        for(let i = config.start; i <= config.end; i++) {
            const ip = `${config.network}.${i}`

            const alreadyUsed = Object.values(leases).some((lease) => lease.ip === ip)

            if(!alreadyUsed) {
                const lease = {
                    ip,
                    subnet: config.subnet,
                    gateway: config.gateway,

                    leasedAt: Date.now()
                }

                set({
                    leases: {
                        ...lease,
                        [mac]: lease
                    }
                })

                return lease
            }
        }

        return null
    },

    getLease: (mac) => {
        return get().leases[mac]
    }
}))

export default useDhcpStore