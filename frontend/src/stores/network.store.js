import { create } from "zustand"
import { INITIAL_METRICS } from '../constants/networkDefaults'

const useNetworkStore = create((set) => ({
    currentNetwork: null,
    nodeMetrics: INITIAL_METRICS,

    activeEdges: [],
    edgeStatus: 'success',

    setActiveEdges: (edges) => set({ activeEdges: edges }),
    setEdgeStatus: (status) => set({ edgeStatus: status }),

    setCurrentNetwork: (network) => {
        set({
            currentNetwork: network
        })
    },

    setNodeMetrics: (updater) => {
        set((state) => ({
            nodeMetrics: typeof updater === 'function' ? updater(state.nodeMetrics) : updater
        }))
    },

    updateNodeMetricById: (id, updater) => {
        set((state) => {
            const currentMetric = state.nodeMetrics[id] || {}
            return {
                nodeMetrics: {
                    ...state.nodeMetrics,
                    [id]: typeof updater === 'function' ? updater(currentMetric) : { ...currentMetric, ...updater }
                }
            }
        })
    }
}))

export default useNetworkStore