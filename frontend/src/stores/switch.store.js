import { create } from 'zustand'

const useSwitchStore = create((set) => ({
    macTable: {},

    learnMac: (switchId, mac, port, vlan = 1) =>
        set((state) => {
            const currentTable = state.macTable[switchId] || {}

            return {
                macTable: {
                    ...state.macTable,

                    [switchId]: {
                        ...currentTable,

                        [mac]: {
                            port,
                            vlan,
                            learnedAt: Date.now()
                        }
                    }
                }
            }
        }),

    clearExpiredEntries: () =>
        set((state) => {
            const updatedTables = {}

            Object.entries(state.macTable).forEach(
                ([switchId, entries]) => {
                    updatedTables[switchId] = {}

                    Object.entries(entries).forEach(
                        ([mac, data]) => {
                            const age = Date.now() - data.learnedAt

                            if (age < 300000) {
                                updatedTables[switchId][mac] = data
                            }
                        }
                    )
                }
            )

            return {
                macTable: updatedTables
            }
        }),

    getPort(switchId, mac) {
        const entry = useSwitchStore.getState().macTable[switchId]?.[mac]
        if (!entry) return null
        
        const age = Date.now() - entry.learnedAt
        if (age > 300000) {
            return null
        }
        return entry
    }
}))

export default useSwitchStore
