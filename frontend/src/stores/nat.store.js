import { create } from 'zustand'

const useNatStore = create((set, get) => ({
    translations: {},
    nextPort: 10000,

    createTranslation: ({ privateIp, privatePort = 0, publicIp }) => {
        const state = get()
        const internalKey = `${privateIp}:${privatePort}`
        
        if (state.translations[internalKey]) {
            return state.translations[internalKey]
        }

        const publicPort = state.nextPort
        const entry = {
            privateIp,
            privatePort,
            publicIp,
            publicPort,
            type: 'PAT',
            createdAt: Date.now()
        }

        set((state) => ({
            translations: {
                ...state.translations,
                [internalKey]: entry
            },
            nextPort: state.nextPort > 65000 ? 10000 : state.nextPort + 1
        }))

        return entry
    },

    getTranslationByPublicPort: (publicPort) => {
        const translations = get().translations
        return Object.values(translations).find(t => t.publicPort === publicPort)
    }
}))

export default useNatStore
