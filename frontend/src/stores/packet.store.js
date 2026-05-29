import { create } from 'zustand'

const usePacketStore = create((set) => ({
    packets: {},
    selectedPacket: null,

    addPacket: (packet) =>
        set((state) => {
            const packetCount = Object.keys(state.packets).length

            if (packetCount > 50) {
                return state
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
            packets: []
        }),

    setSelectedPacket: (packet) =>
        set({
            selectedPacket: packet
        })
}))

export default usePacketStore