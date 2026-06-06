const express = require('express')
const router = express.Router()

const networkController = require('./network.controller')
const authMiddleware = require('../../middleware/auth.middleware')

router.post('/', authMiddleware, networkController.createNetwork)
router.get('/', authMiddleware, networkController.getNetwork)
router.get('/:id', authMiddleware, networkController.getNetworkById)
router.put('/:id', authMiddleware, networkController.updateNetwork)
router.delete('/:id', authMiddleware, networkController.deleteNetwork)

module.exports = router