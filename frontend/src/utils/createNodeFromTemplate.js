export function createNodeFromTemplate(template) {
    return {
        id: `${Date.now()}-${Math.random()}`,

        position: {
            x: Math.random() * 100,
            y: Math.random() * 100
        },

        type: template.type,

        data:{
            ...template.data
        }
    }
}