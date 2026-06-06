const express = require('express')
const router = express.Router()
const deploymentController = require('./deployment.controller')

router.post('/:networkId/deploy', (req, res) => deploymentController.deployNetwork(req, res))
router.post('/:networkId/destroy', (req, res) => deploymentController.destroyNetwork(req, res))
router.post('/:networkId/restart', (req, res) => deploymentController.restartNetwork(req, res))
router.get('/:networkId/status', (req, res) => deploymentController.getDeploymentStatus(req, res))
router.get('/node/:nodeId/status', (req, res) => deploymentController.getNodeDeploymentStatus(req, res))

module.exports = router
