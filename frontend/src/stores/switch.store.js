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
        return (
            useSwitchStore.getState().macTable[switchId]?.[mac]
        )
    }
}))

export default useSwitchStore
