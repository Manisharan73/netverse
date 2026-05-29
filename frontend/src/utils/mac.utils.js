export function generateMacAddress() {
    return Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, '0')
    ).join(':')
}