import { create } from 'zustand'

const usePacketStore = create((set) => ({
    packets: {},
    selectedPacket: null,
    filterProtocol: 'ALL',
    searchQuery: '',

    setFilterProtocol: (protocol) => set({ filterProtocol: protocol }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    addPacket: (packet) =>
        set((state) => {
            const packetKeys = Object.keys(state.packets)

            if (packetKeys.length > 500) {
                const oldest = packetKeys[0]
                const newPackets = { ...state.packets }
                delete newPackets[oldest]
                return {
                    packets: {
                        ...newPackets,
                        [packet.id]: packet
                    }
                }
            }

            return {
                packets: {
                    ...state.packets,
                    [packet.id]: packet
                }
            }
        }),

    removePacket: (packetId) =>
        set((state) => {
            const updated = { ...state.packets }
            delete updated[packetId]
            return {
                packets: updated
            }
        }),

    clearPackets: () =>
        set({
            packets: {}
        }),

    setSelectedPacket: (packet) =>
        set({
            selectedPacket: packet
        }),

    updatePacket: (packetId, updater) =>
        set((state) => {
            const packet = state.packets[packetId]
            if (!packet) return state
            return {
                packets: {
                    ...state.packets,
                    [packetId]: updater(packet)
                }
            }
        }),
}))

export default usePacketStore