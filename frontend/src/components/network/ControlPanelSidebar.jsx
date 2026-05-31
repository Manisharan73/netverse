import React, { useState } from 'react'
import ConfigPanel from './ConfigPanel'
import RoutingPanel from './RoutingPanel'
import MacTablePanel from './MacTablePanel'
import ArpTablePanel from './ArpTablePanel'
import NatTablePanel from './NatTablePanel'
import PacketInspector from './PacketInspector'
import EventTimeline from './EventTimeline'
import AlertsPanel from './AlertsPanel'
import IncidentsPanel from './IncidentsPanel'

function ControlPanelSidebar({
    selectedNode, selectedEdge, nodes, setNodes, setEdges, setSelectedNode, setSelectedEdge,
    pingTarget, setPingTarget, pingNode, deleteSelectedNode, updateServiceStatus, restartService, deployUpdate,
    routingTable,
    alerts, incidents
}) {
    const [activeTab, setActiveTab] = useState('config')

    React.useEffect(() => {
        if (selectedNode || selectedEdge) {
            setActiveTab('config')
        }
    }, [selectedNode, selectedEdge])

    return (
        <div className="right-control-panel panel-dark" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '400px', flexShrink: 0, borderLeft: '1px solid var(--border-dark)', background: 'var(--bg-panel)' }}>
            <div className="control-tabs" style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border-dark)', padding: '0 8px' }}>
                <button style={{ padding: '12px 16px', background: 'none', border: 'none', color: activeTab === 'config' ? '#fff' : 'var(--text-secondary)', borderBottom: activeTab === 'config' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }} onClick={() => setActiveTab('config')}>Config</button>
                <button style={{ padding: '12px 16px', background: 'none', border: 'none', color: activeTab === 'routing' ? '#fff' : 'var(--text-secondary)', borderBottom: activeTab === 'routing' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }} onClick={() => setActiveTab('routing')}>Routing</button>
                <button style={{ padding: '12px 16px', background: 'none', border: 'none', color: activeTab === 'tables' ? '#fff' : 'var(--text-secondary)', borderBottom: activeTab === 'tables' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }} onClick={() => setActiveTab('tables')}>Tables</button>
                <button style={{ padding: '12px 16px', background: 'none', border: 'none', color: activeTab === 'sniffer' ? '#fff' : 'var(--text-secondary)', borderBottom: activeTab === 'sniffer' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }} onClick={() => setActiveTab('sniffer')}>Sniffer</button>
                <button style={{ padding: '12px 16px', background: 'none', border: 'none', color: activeTab === 'events' ? '#fff' : 'var(--text-secondary)', borderBottom: activeTab === 'events' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }} onClick={() => setActiveTab('events')}>Events</button>
            </div>

            <div className="control-content styled-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {activeTab === 'config' && (
                    <ConfigPanel
                        selectedNode={selectedNode}
                        selectedEdge={selectedEdge}
                        nodes={nodes}
                        setNodes={setNodes}
                        setEdges={setEdges}
                        setSelectedNode={setSelectedNode}
                        setSelectedEdge={setSelectedEdge}
                        pingTarget={pingTarget}
                        setPingTarget={setPingTarget}
                        pingNode={pingNode}
                        deleteSelectedNode={deleteSelectedNode}
                        updateServiceStatus={updateServiceStatus}
                        restartService={restartService}
                        deployUpdate={deployUpdate}
                    />
                )}

                {activeTab === 'routing' && <RoutingPanel routingTable={routingTable} />}

                {activeTab === 'tables' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <MacTablePanel />
                        <ArpTablePanel />
                        <NatTablePanel />
                    </div>
                )}

                {activeTab === 'sniffer' && <PacketInspector />}

                {activeTab === 'events' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <IncidentsPanel incidents={incidents} />
                        <AlertsPanel alerts={alerts} />
                        <EventTimeline />
                    </div>
                )}
            </div>
        </div>
    )
}

export default React.memo(ControlPanelSidebar)
