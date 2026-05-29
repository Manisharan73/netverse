import { create } from 'zustand'

const useEventStore = create((set) => ({
    events: [],

    addEvent: (event) =>
        set((state) => ({
            events: [
                {
                    id: crypto.randomUUID(),
                    timeStamp: Date.now(),
                    ...event
                },

                ...state.events
            ].slice(0, 250)
        })),

        clearEvents: () => 
            set({
                events: []
            })
}))

export default useEventStore