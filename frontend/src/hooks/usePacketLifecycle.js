import { useEffect } from "react"
import usePacketStore from '../stores/packet.store'

export default function usePacketLifecycle() {
    // The backend now completely handles packet lifecycles.
    // It emits 'packet:dropped' or 'packet:delivered' to clean up packets.
    useEffect(() => {
        // No-op for Phase 1
    }, [])
}