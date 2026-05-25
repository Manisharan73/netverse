export const STATUS_ENUMS = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    WARNING: 'WARNING',
    RESTARTING: 'RESTARTING',
    RUNNING: 'RUNNING'
}

export const INITIAL_NODES = [
    {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Main Router', ip: '192.168.1.1', os: 'Cisco IOS', subnet: '192.168.1.0/24', gateway: '192.168.1.1' },
        type: 'routerNode',
    },
    {
        id: '2',
        position: { x: 400, y: 200 },
        data: { label: 'Web Server', ip: '10.0.0.25', os: 'Ubuntu 22.04' },
        type: 'serverNode',
    },
]

export const INITIAL_EDGES = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true
    },
]

export const INITIAL_METRICS = {
    '1': {
        status: STATUS_ENUMS.ONLINE,
        uptime: '12 days',
        traffic: 0,
        packetsSent: 0,
        packetsReceived: 0,
        packetLoss: 0,
    },
    '2': {
        status: STATUS_ENUMS.ONLINE,
        cpu: '32%',
        ram: '58%',
        storage: '71%',
        traffic: 0,
        packetsSent: 0,
        packetsReceived: 0,
        packetLoss: 0,
        services: [
            { id: 1, name: 'nginx', status: STATUS_ENUMS.RUNNING, cpu: 12, memory: 22, port: 80 },
            { id: 2, name: 'auth-service', status: STATUS_ENUMS.RUNNING, cpu: 18, memory: 30, port: 3000 },
            { id: 3, name: 'redis', status: STATUS_ENUMS.RUNNING, cpu: 9, memory: 18, port: 6379 }
        ],
        uptime: '30 days',
    }
}

export const DEFAULT_ROUTER_DATA = {
    label: 'Router',
    ip: '192.168.1.1',
    os: 'Cisco IOS',
    subnet: '192.168.1.0/24',
    gateway: '192.168.1.1'
}

export const DEFAULT_ROUTER_METRICS = {
    status: STATUS_ENUMS.ONLINE,
    uptime: '12 days',
    traffic: 0,
    packetsSent: 0,
    packetsReceived: 0,
    packetLoss: 0,
}

export const DEFAULT_SERVER_DATA = {
    label: 'Server',
    ip: '10.0.0.25',
    os: 'Ubuntu 22.04'
}

export const DEFAULT_SERVER_METRICS = {
    status: STATUS_ENUMS.ONLINE,
    cpu: '32%',
    ram: '58%',
    storage: '71%',
    traffic: 0,
    packetsSent: 0,
    packetsReceived: 0,
    packetLoss: 0,
    services: [
        { id: 1, name: 'nginx', status: STATUS_ENUMS.RUNNING, cpu: 12, memory: 22, port: 80 },
        { id: 2, name: 'auth-service', status: STATUS_ENUMS.RUNNING, cpu: 18, memory: 30, port: 3000 },
        { id: 3, name: 'redis', status: STATUS_ENUMS.RUNNING, cpu: 9, memory: 18, port: 6379 }
    ]
}
