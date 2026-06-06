const express = require('express')
const controller = require('./docker.controller')

const router = express.Router()

router.get('/health', controller.health)
router.post('/nodes/:id/create', controller.createContainer)
router.post('/nodes/:id/start', controller.startContainer)
router.post('/nodes/:id/stop', controller.stopContainer)
router.post('/nodes/:id/restart', controller.restartContainer)
router.delete('/nodes/:id', controller.deleteContainer)
router.get('/nodes/:id/status', controller.inspectContainer)

module.exports = router