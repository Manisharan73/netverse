import { create } from 'zustand'

const useNatStore = create((set, get) => ({
    translations: {},

    createTranslation: ({
        privateIp,
        publicIp
    }) => {
        const key = `${privateIp}-${publicIp}`

        const entry = {
            privateIp,
            publicIp,
            createdAt: Date.now()
        }

        set((state) => ({
            translations: {
                ...state.translations,
                [key]: entry
            }
        }))

        return entry
    }
}))

export default useNatStore
