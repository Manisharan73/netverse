const Network = require('../../models/network.model')
const Node = require('../../models/node.model')
const Edge = require('../../models/edge.model')
const sequelize = require('../../database/index')

const NODE_TYPE_MAP = {
    routerNode: 'ROUTER',
    switchNode: 'SWITCH',
    serverNode: 'SERVER',
    hostNode: 'HOST'
}

async function createNetwork(userId, data) {
    console.log(userId, data)

    let transaction;

    try {
        transaction = await sequelize.transaction()

        const network = await Network.create({
            name: data.name || 'Untitled Network',
            description: data.description || '',
            userId
        }, { transaction })

        if (Array.isArray(data.nodes) && data.nodes.length > 0) {
            const nodesToCreate = data.nodes.map((node) => ({
                frontendId: String(node.id),
                networkId: network.id,
                type: NODE_TYPE_MAP[node.type] || 'HOST',
                label: node.data?.label || node.data?.hostname || 'Node',
                ipAddress: node.data?.ip || node.data?.ipAddress || '',
                subnet: node.data?.subnet || '',
                gateway: node.data?.gateway || '',
                os: node.data?.os || '',
                hostname: node.data?.hostname || '',
                macAddress: node.data?.macAddress || '',
                metrics: node.metrics || null,
                posX: Number(node.position?.x) || 0,
                posY: Number(node.position?.y) || 0,
                status: node.data?.status || 'ONLINE'
            }))

            await Node.bulkCreate(nodesToCreate, { transaction })
        }

        if (Array.isArray(data.edges) && data.edges.length > 0) {
            const createdNodes = await Node.findAll({
                where: { networkId: network.id },
                transaction
            })
            const nodeMap = {}
            createdNodes.forEach(n => {
                nodeMap[n.frontendId] = n.id
            })

            const edgesToCreate = data.edges.map((edge) => ({
                networkId: network.id,
                sourceNodeId: nodeMap[edge.source],
                targetNodeId: nodeMap[edge.target],
                bandwidth: edge.data?.bandwidth ?? 100,
                latency: edge.data?.latency ?? 10,
                packetLoss: edge.data?.packetLoss ?? 0.02,
                status: edge.data?.status || 'ONLINE',
                traffic: edge.data?.traffic ?? 0
            }))

            await Edge.bulkCreate(edgesToCreate, { transaction })
        }

        await transaction.commit()
        return await getNetworkById(network.id, userId)
    } catch (err) {
        console.error(err)

        if (transaction) {
            await transaction.rollback()
        }
        
        throw err
    }
}

async function getNetwork(userId) {
    return await Network.findAll({
        where: { userId },
        include: [
            { model: Node },
            { model: Edge }
        ]
    })
}

async function getNetworkById(id, userId) {
    return await Network.findByPk(id, {
        where: { userId },
        include: [
            {
                model: Node,
                order: [['id', 'ASC']]
            },
            {
                model: Edge,
                order: [['id', 'ASC']]
            }
        ]
    })
}

async function updateNetwork(id, userId, data) {
    let transaction;

    try {
        transaction = await sequelize.transaction()

        const network = await Network.findByPk(id, {
            where: { userId },
            transaction
        })

        if (!network) {
            throw new Error('Network not found or unauthorized!')
        }

        await network.update({
            name: data.name,
            description: data.description,
            simulation: data.simulation
        }, { transaction })

        await Edge.destroy({
            where: {
                networkId: id
            },
            transaction
        })

        await Node.destroy({
            where: {
                networkId: id
            },
            transaction
        })

        if (Array.isArray(data.nodes) && data.nodes.length > 0) {
            const nodesToCreate = data.nodes.map((node) => ({
                frontendId: String(node.id),
                networkId: id,
                type: NODE_TYPE_MAP[node.type] || 'HOST',
                label: node.data?.label || node.data?.hostname || 'Node',
                ipAddress: node.data?.ip || node.data?.ipAddress || '',
                subnet: node.data?.subnet || '',
                gateway: node.data?.gateway || '',
                os: node.data?.os || '',
                hostname: node.data?.hostname || '',
                macAddress: node.data?.macAddress || '',
                metrics: node.metrics || null,
                posX: Number(node.position?.x) || 0,
                posY: Number(node.position?.y) || 0,
                status: node.data?.status || 'ONLINE'
            }))

            await Node.bulkCreate(nodesToCreate, { transaction })
        }

        if (Array.isArray(data.edges) && data.edges.length > 0) {
            const createdNodes = await Node.findAll({
                where: { networkId: id },
                transaction
            })
            const nodeMap = {}
            createdNodes.forEach(n => {
                nodeMap[n.frontendId] = n.id
            })

            const edgesToCreate = data.edges.map((edge) => ({
                networkId: id,
                sourceNodeId: nodeMap[edge.source],
                targetNodeId: nodeMap[edge.target],
                bandwidth: edge.data?.bandwidth ?? 100,
                latency: edge.data?.latency ?? 10,
                packetLoss: edge.data?.packetLoss ?? 0.02,
                status: edge.data?.status || 'ONLINE',
                traffic: edge.data?.traffic ?? 0
            }))

            await Edge.bulkCreate(edgesToCreate, { transaction })
        }

        await transaction.commit()
        return await getNetworkById(network.id, userId)
    } catch (err) {
        if (transaction) {
            await transaction.rollback()
        }

        throw err
    }
}

module.exports = {
    createNetwork,
    getNetwork,
    getNetworkById,
    updateNetwork
}