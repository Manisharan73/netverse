import { create } from 'zustand'

const useAlertStore = create((set) => ({
    alerts: [],
    incidents: [],

    addAlert: (alert) =>
        set((state) => ({
            alerts: [
                {
                    id: alert.id || crypto.randomUUID(),
                    timeStamp: alert.timeStamp || Date.now(),
                    ...alert
                },
                ...state.alerts
            ].slice(0, 100)
        })),

    addIncident: (incident) =>
        set((state) => ({
            incidents: [
                {
                    id: incident.id || crypto.randomUUID(),
                    timeStamp: incident.timeStamp || Date.now(),
                    ...incident
                },
                ...state.incidents
            ].slice(0, 50)
        })),

    clearAlerts: () =>
        set({
            alerts: []
        }),

    clearIncidents: () =>
        set({
            incidents: []
        })
}))

export default useAlertStore
