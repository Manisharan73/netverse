import { create } from 'zustand'

const useStpStore = create((set) => ({
    rootBridge: null,

    blockedEdges: [],

    setRootBridge(rootBridge) {
        set({ rootBridge })
    },

    setBlockedEdges(blockedEdges) {
        set({ blockedEdges })
    }
}))

export default useStpStore