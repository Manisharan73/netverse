import useNatStore from '../stores/nat.store'

export function isPrivateIp(ip) {
    return (
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('172.')
    )
}

export function requiresNat({
    sourceIp,
    targetIp
}) {
    return (
        isPrivateIp(sourceIp) &&
        !isPrivateIp(targetIp)
    )
}

export function performNat({
    sourceIp,
    publicIp
}) {
    return useNatStore
        .getState()
        .createTranslation({
            privateIp: sourceIp,
            publicIp
        })
}
