import { create } from 'zustand'

import {
    DEFAULT_FIREWALL_RULES
}
from '../constants/firewall.config'

const useFirewallStore = create((set) => ({
    rules: DEFAULT_FIREWALL_RULES,

    addRule: (rule) =>
        set((state) => ({
            rules: [
                ...state.rules,
                {
                    id: Date.now(),
                    ...rule
                }
            ]
        })),

    removeRule: (id) =>
        set((state) => ({
            rules:
                state.rules.filter(
                    (rule) => rule.id !== id
                )
        }))
}))

export default useFirewallStore
