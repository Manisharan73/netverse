export function isTrafficAllowed({
    rules,
    sourceIp,
    targetIp,
    protocol
}) {
    for (const rule of rules) {
        const sourceMatch =
            rule.source === 'ANY' ||
            rule.source === sourceIp

        const targetMatch =
            rule.target === 'ANY' ||
            rule.target === targetIp

        const protocolMatch =
            rule.protocol === 'ANY' ||
            rule.protocol === protocol

        if (
            sourceMatch &&
            targetMatch &&
            protocolMatch
        ) {
            return rule.action === 'ALLOW'
        }
    }

    return true
}
