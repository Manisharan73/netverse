import { useEffect } from "react"
import usePacketStore from '../stores/packet.store'

export default function usePacketSimulation({ nodes, edges }) {
    // The backend now completely handles packet location updates.
    // We keep this hook around in case we need frontend-specific smoothing,
    // but the actual location/progress logic has moved to WebSocket events.
    useEffect(() => {
        // No-op for Phase 1. 
        // PacketRenderer handles smooth transition between current and previous location.
    }, [])
}