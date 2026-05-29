import { create } from 'zustand'

const useArpStore = create((set) => ({
    arpTable: {},

    addArpEntry: (ip, mac) => {
        set((state) => ({
            arpTable: {
                ...state.arpTable,
                [ip]: mac
            }
        }))
    },

    getMac: (ip) => {
        return useArpStore.getState().arpTable[ip]
    },

    clearArpTable: () => {
        set({
            arpTable: {}
        })
    }
}))

export default useArpStore