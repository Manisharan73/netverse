import useNatStore from '../stores/nat.store'

export function isPrivateIp(ip) {
    if (!ip) return false
    return (
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('172.')
    )
}

export function requiresNat({ sourceIp, targetIp }) {
    return isPrivateIp(sourceIp) && !isPrivateIp(targetIp)
}

export function performNat({ sourceIp, sourcePort = 0, publicIp }) {
    return useNatStore.getState().createTranslation({
        privateIp: sourceIp,
        privatePort: sourcePort,
        publicIp
    })
}

export function reverseNat({ publicPort }) {
    return useNatStore.getState().getTranslationByPublicPort(publicPort)
}
