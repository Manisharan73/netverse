import { create } from "zustand"

const useNetworkStore = create((set) => ({
    currentNetwork: null,

    setCurrentNetwork: (network) => {
        set({
            currentNetwork: network
        })
    }
}))

export default useNetworkStore