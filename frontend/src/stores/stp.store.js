import { create } from 'zustand'

const useStpStore = create((set) => ({
    rootBridge: null,
    blockedEdges: [],
    portStates: {},
    bridgePriorities: {},

    setRootBridge(rootBridge) {
        set({ rootBridge })
    },

    setBlockedEdges(blockedEdges) {
        set({ blockedEdges })
    },

    setPortStates(portStates) {
        set({ portStates })
    },

    setBridgePriority(switchId, priority) {
        set((state) => ({
            bridgePriorities: {
                ...state.bridgePriorities,
                [switchId]: priority
            }
        }))
    }
}))

export default useStpStore