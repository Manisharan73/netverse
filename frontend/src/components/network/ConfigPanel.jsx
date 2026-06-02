import socket from '../../websocket/socket'
import useNetworkStore from '../../stores/network.store'
import React, { useState, useEffect } from 'react'
import useFirewallStore from '../../stores/firewall.store'

function ConfigPanel({ selectedNode, selectedEdge, nodes, setNodes, setEdges, setSelectedNode, setSelectedEdge, pingTarget, setPingTarget, pingNode, deleteSelectedNode, updateServiceStatus, restartService, deployUpdate }) {
    const nodeMetrics = useNetworkStore((state) => state.nodeMetrics)

    const firewallRules = useFirewallStore((state) => state.rules)

    const [packetType, setPacketType] = useState('ICMP')

    const [localNodeData, setLocalNodeData] = useState({
        label: '',
        ip: '',
        hostname: '',
        subnet: '',
        vlan: 1,
        gateway: ''
    })

    useEffect(() => {
        if (selectedNode) {
            setLocalNodeData({
                label: selectedNode.data.label || '',
                ip: selectedNode.data.ip || '',
                hostname: selectedNode.data.hostname || '',
                subnet: selectedNode.data.subnet || '',
                vlan: selectedNode.data.vlan || 1,
                gateway: selectedNode.data.gateway || ''
            })
        }
    }, [selectedNode?.id])

    const handleNodeBlur = (field) => {
        const value = localNodeData[field]

        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            [field]: value
                        }
                    }
                }
                return node
            })
        )

        setSelectedNode((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value
            }
        }))

        if (field === 'label') {
            socket.emit('node:updateLabel', { id: selectedNode.id, label: value })
        }
    }

    const handleAddRule = (rule) => {
        const currentNetwork = useNetworkStore.getState().currentNetwork
        if (!currentNetwork || !selectedNode) return

        socket.emit('firewall:addRule', {
            networkId: currentNetwork.id,
            nodeId: selectedNode.id,
            rule
        })
    }

    const handleRemoveRule = (ruleId) => {
        const currentNetwork = useNetworkStore.getState().currentNetwork
        if (!currentNetwork) return

        socket.emit('firewall:removeRule', {
            networkId: currentNetwork.id,
            ruleId
        })
    }

    async function requestDhcp() {
        if (!selectedNode) return

        const currentNetwork = useNetworkStore.getState().currentNetwork
        if (!currentNetwork) return

        socket.emit('dhcp:request', {
            networkId: currentNetwork.id,
            nodeId: selectedNode.id
        })
    }

    if (!selectedNode && !selectedEdge) return null

    if (selectedEdge) {
        const handleEdgeUpdate = (field, value) => {
            const updatedEdge = {
                ...selectedEdge,
                data: {
                    ...selectedEdge.data,
                    [field]: field === 'status' ? value : Number(value)
                }
            }

            setSelectedEdge(updatedEdge)

            setEdges((currentEdges) =>
                currentEdges.map((edge) =>
                    edge.id === selectedEdge.id ? updatedEdge : edge
                )
            )
        }

        return (
            <div className="config-panel styled-scroll">
                <div className="panel-header">
                    <h3>Edge Configuration</h3>
                    <span className="badge">ID: {selectedEdge.id}</span>
                </div>

                <div className="panel-section">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Bandwidth (Mbps)</label>
                            <input
                                type="number"
                                value={selectedEdge.data?.bandwidth || 0}
                                onChange={(e) => handleEdgeUpdate('bandwidth', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Latency (ms)</label>
                            <input
                                type="number"
                                value={selectedEdge.data?.latency || 0}
                                onChange={(e) => handleEdgeUpdate('latency', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Packet Loss (0-1)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={selectedEdge.data?.packetLoss || 0}
                                onChange={(e) => handleEdgeUpdate('packetLoss', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={selectedEdge.data?.status || 'ONLINE'}
                                onChange={(e) => handleEdgeUpdate('status', e.target.value)}
                            >
                                <option value="ONLINE">ONLINE</option>
                                <option value="OFFLINE">OFFLINE</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="panel-section border-none">
                    <h4>Traffic Simulator</h4>
                    <p className="text-muted">Current Traffic: <strong>{selectedEdge.data?.traffic || 0}</strong></p>
                    <select
                        className="mt-2"
                        value={packetType}
                        onChange={(e) => setPacketType(e.target.value)}
                    >
                        <option value="ICMP">ICMP</option>
                        <option value="HTTP">HTTP</option>
                        <option value="HTTPS">HTTPS</option>
                        <option value="DNS">DNS</option>
                        <option value="VOIP">VOIP</option>
                    </select>
                </div>
            </div>
        )
    }

    const metric = nodeMetrics[selectedNode.id] || {}

    return (
        <div className="config-panel styled-scroll">
            <div className="panel-header">
                <h3>Node Configuration</h3>
                <span className="badge">{selectedNode.type}</span>
            </div>

            {/* General Info */}
            <div className="panel-section">
                <h4>General</h4>
                <div className="form-grid">
                    <div className="form-group col-span-2">
                        <label>Label</label>
                        <input
                            type="text"
                            value={localNodeData.label}
                            onChange={(e) => setLocalNodeData({ ...localNodeData, label: e.target.value })}
                            onBlur={() => handleNodeBlur('label')}
                        />
                    </div>
                    <div className="form-group col-span-2">
                        <label>Hostname</label>
                        <input
                            type="text"
                            value={localNodeData.hostname}
                            onChange={(e) => setLocalNodeData({ ...localNodeData, hostname: e.target.value })}
                            onBlur={() => handleNodeBlur('hostname')}
                        />
                    </div>
                </div>
            </div>

            {/* Network Settings */}
            <div className="panel-section">
                <h4>Network</h4>
                <div className="form-grid">
                    <div className="form-group col-span-2">
                        <label>IP Address</label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                value={localNodeData.ip}
                                onChange={(e) => setLocalNodeData({ ...localNodeData, ip: e.target.value })}
                                onBlur={() => handleNodeBlur('ip')}
                            />
                            <button className="btn-secondary" onClick={requestDhcp} title="Request DHCP">DHCP</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Subnet</label>
                        <input
                            type="text"
                            value={localNodeData.subnet}
                            onChange={(e) => setLocalNodeData({ ...localNodeData, subnet: e.target.value })}
                            onBlur={() => handleNodeBlur('subnet')}
                        />
                    </div>
                    <div className="form-group">
                        <label>VLAN</label>
                        <input
                            type="number"
                            value={localNodeData.vlan}
                            onChange={(e) => setLocalNodeData({ ...localNodeData, vlan: Number(e.target.value) })}
                            onBlur={() => handleNodeBlur('vlan')}
                        />
                    </div>
                    <div className="form-group col-span-2">
                        <label>Gateway</label>
                        <input
                            type="text"
                            value={localNodeData.gateway}
                            onChange={(e) => setLocalNodeData({ ...localNodeData, gateway: e.target.value })}
                            onBlur={() => handleNodeBlur('gateway')}
                        />
                    </div>
                </div>
            </div>

            {/* System Metrics (Router) */}
            {selectedNode.type === 'routerNode' && (
                <div className="panel-section metrics-box">
                    <div className="metric"><span>OS</span><strong>{selectedNode.data.os}</strong></div>
                    <div className="metric"><span>Uptime</span><strong>{metric.uptime || 'N/A'}</strong></div>
                </div>
            )}

            {/* System Metrics & Services (Server) */}
            {selectedNode.type === 'serverNode' && (
                <>
                    <div className="panel-section metrics-box">
                        <div className="metric"><span>CPU</span><strong>{metric.cpu || '0%'}</strong></div>
                        <div className="metric"><span>RAM</span><strong>{metric.ram || '0%'}</strong></div>
                        <div className="metric"><span>Storage</span><strong>{metric.storage || '0%'}</strong></div>
                    </div>

                    <div className="panel-section">
                        <h4>Services</h4>
                        <div className="services-list">
                            {metric.services?.map((service) => (
                                <div key={service.id} className="service-card">
                                    <div className="service-header">
                                        <strong>{service.name}</strong>
                                        <span className={`status-badge ${service.status?.toLowerCase()}`}>{service.status}</span>
                                    </div>
                                    <div className="service-stats">
                                        <span>CPU: {service.cpu}%</span>
                                        <span>MEM: {service.memory}%</span>
                                        <span>Port: {service.port}</span>
                                    </div>
                                    <div className="service-actions">
                                        <button className="btn-sm btn-success" onClick={() => updateServiceStatus(selectedNode.id, service.id, 'RUNNING')}>Start</button>
                                        <button className="btn-sm btn-danger" onClick={() => updateServiceStatus(selectedNode.id, service.id, 'FAILED')}>Stop</button>
                                        <button className="btn-sm btn-secondary" onClick={() => restartService(selectedNode.id, service.id)}>Restart</button>
                                        <button className="btn-sm btn-outline" onClick={() => deployUpdate(selectedNode.id)}>Deploy</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Testing Tools */}
            <div className="panel-section">
                <h4>Diagnostics</h4>
                <div className="input-with-button">
                    <input
                        type="text"
                        placeholder="Target (IP/Hostname)"
                        value={pingTarget}
                        onChange={(e) => setPingTarget(e.target.value)}
                    />
                    <button className="btn-primary" onClick={() => pingNode(packetType)}>Ping</button>
                </div>
            </div>

            {/* Firewall Rules */}
            <div className="panel-section firewall-panel">
                <h4>Firewall Rules</h4>
                <div className="firewall-list">
                    {firewallRules.map((rule) => (
                        <div key={rule.id} className="firewall-rule">
                            <span className="rule-text">
                                <strong className={rule.action === 'DENY' ? 'text-danger' : 'text-success'}>{rule.action}</strong> {rule.protocol}
                                <br /><small>{rule.source} → {rule.target}</small>
                            </span>
                            <button className="btn-sm btn-danger-outline" onClick={() => handleRemoveRule(rule.id)}>Del</button>
                        </div>
                    ))}
                </div>
                <button
                    className="btn-secondary w-full mt-2"
                    onClick={() => handleAddRule({ action: 'DENY', protocol: 'ICMP', source: 'ANY', target: '8.8.8.8' })}
                >
                    + Block Google DNS
                </button>
            </div>

            {/* Danger Zone */}
            <div className="panel-section border-none pt-4">
                <button className="btn-danger w-full" onClick={deleteSelectedNode}>
                    Delete Node
                </button>
            </div>
        </div>
    )
}

export default React.memo(ConfigPanel)