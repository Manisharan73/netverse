import { create } from 'zustand'

const useArpStore = create((set, get) => ({
    arpTable: {},

    addArpEntry: (nodeId, ip, mac) => {
        set((state) => {
            const nodeTable = state.arpTable[nodeId] || {}
            return {
                arpTable: {
                    ...state.arpTable,
                    [nodeId]: {
                        ...nodeTable,
                        [ip]: {
                            mac,
                            learnedAt: Date.now()
                        }
                    }
                }
            }
        })
    },

    getMac: (nodeId, ip) => {
        const state = get()
        const entry = state.arpTable[nodeId]?.[ip]
        if (!entry) return null
        
        const age = Date.now() - entry.learnedAt
        if (age > 300000) {
            return null
        }
        return entry.mac
    },

    clearExpiredEntries: () => {
        set((state) => {
            const updatedTables = {}
            Object.entries(state.arpTable).forEach(([nodeId, entries]) => {
                updatedTables[nodeId] = {}
                Object.entries(entries).forEach(([ip, data]) => {
                    const age = Date.now() - data.learnedAt
                    if (age <= 300000) {
                        updatedTables[nodeId][ip] = data
                    }
                })
            })
            return { arpTable: updatedTables }
        })
    },

    clearArpTable: (nodeId = null) => {
        if (nodeId) {
            set((state) => {
                const newTable = { ...state.arpTable }
                delete newTable[nodeId]
                return { arpTable: newTable }
            })
        } else {
            set({ arpTable: {} })
        }
    }
}))

export default useArpStore