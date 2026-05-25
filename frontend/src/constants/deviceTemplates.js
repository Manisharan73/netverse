export const DEVICE_TEMPLATES = {
    CISCO_ROUTER: {
        type: 'routerNode',

        data: {
            label: 'Cisco Router',
            status: 'ONLINE',

            ip: '192.168.1.1',
            subnet: '192.168.1.0/24',
            gateway: '192.168.1.1',

            os: 'Cisco IOS',
            uptime: '15 days',

            traffic: 0,
            packetsSent: 0,
            packetsReceived: 0,
            packetLoss: 0
        }
    },

    LINUX_SERVER: {
        type: 'serverNode',

        data: {
            label: 'Linux Server',
            status: 'ONLINE',

            ip: '10.0.0.10',
            subnet: '10.0.0.0/24',
            gateway: '10.0.0.1',

            os: 'Ubuntu 22.04',

            cpu: '20%',
            ram: '35%',
            storage: '50%',

            traffic: 0,
            packetsSent: 0,
            packetsReceived: 0,
            packetLoss: 0,

            services: [
                {
                    id: 1,
                    name: 'nginx',
                    status: 'RUNNING',
                    cpu: 12,
                    memory: 20,
                    port: 80
                },

                {
                    id: 2,
                    name: 'docker',
                    status: 'RUNNING',
                    cpu: 10,
                    memory: 18,
                    port: 2375
                }
            ]
        }
    },

    DATABASE_SERVER: {
        type: 'serverNode',

        data: {
            label: 'Database Server',
            status: 'ONLINE',

            ip: '10.0.1.20',
            subnet: '10.0.1.0/24',
            gateway: '10.0.1.1',

            os: 'Ubuntu Server',

            cpu: '40%',
            ram: '70%',
            storage: '80%',

            traffic: 0,
            packetsSent: 0,
            packetsReceived: 0,
            packetLoss: 0,

            services: [
                {
                    id: 1,
                    name: 'postgres',
                    status: 'RUNNING',
                    cpu: 35,
                    memory: 40,
                    port: 5432
                },

                {
                    id: 2,
                    name: 'redis',
                    status: 'RUNNING',
                    cpu: 12,
                    memory: 15,
                    port: 6379
                }
            ]
        }
    },

    FIREWALL: {
        type: 'routerNode',

        data: {
            label: 'Firewall',
            status: 'ONLINE',

            ip: '172.16.0.1',
            subnet: '172.16.0.0/24',
            gateway: '172.16.0.1',

            os: 'pfSense',
            uptime: '30 days',

            traffic: 0,
            packetsSent: 0,
            packetsReceived: 0,
            packetLoss: 0
        }
    }
}