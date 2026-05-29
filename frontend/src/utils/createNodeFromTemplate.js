import { generateMacAddress } from "./mac.utils"

export function createNodeFromTemplate(template) {
    return {
        id: crypto.randomUUID(),

        position: {
            x: Math.random() * 100,
            y: Math.random() * 100
        },

        type: template.type,

        data: {
            ...template.data,
            mac: generateMacAddress()
        }
    }
}