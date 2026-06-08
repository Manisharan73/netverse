const express = require('express')
const router = express.Router()
const monitoringController = require('./monitoring.controller')

router.get('/network/:networkId', monitoringController.getNetworkMetrics)
router.get('/network/:networkId/node/:nodeId', monitoringController.getNodeMetrics)
router.get('/health', monitoringController.getHealth)

module.exports = router
