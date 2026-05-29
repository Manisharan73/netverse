import { create } from 'zustand'
import { DEFAULT_DNS_RECORDS } from '../constants/dns.config'

const useDnsStore = create((set, get) => ({
    records: DEFAULT_DNS_RECORDS,

    cache: {},

    resolveDomain: (domain) => {
        const cache = get().cache

        if(cache[domain]) {
            return cache[domain]
        }

        const ip = get().records[domain]

        if(ip) {
            set({
                cache: {
                    ...cache,
                    [domain]: ip
                }
            })
        }

        return ip || null
    },

    addRecord: (domain, ip) =>
        set((state) => ({
            records: {
                ...state.records,
                [domain]: ip
            }
        }))
}))

export default useDnsStore