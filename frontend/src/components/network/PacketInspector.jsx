import React from "react"
import usePacketStore from '../../stores/packet.store'

function PacketInspector() {
    const packets = usePacketStore((state) => state.packets)
    const selectedPacket = usePacketStore((state) => state.selectedPacket)
    const filterProtocol = usePacketStore((state) => state.filterProtocol)
    const searchQuery = usePacketStore((state) => state.searchQuery)
    
    const setFilterProtocol = usePacketStore((state) => state.setFilterProtocol)
    const setSearchQuery = usePacketStore((state) => state.setSearchQuery)
    const setSelectedPacket = usePacketStore((state) => state.setSelectedPacket)
    const clearPackets = usePacketStore((state) => state.clearPackets)

    const packetList = Object.values(packets).filter(p => {
        if (filterProtocol !== 'ALL' && p.type !== filterProtocol) return false
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                p.sourceId?.toLowerCase().includes(query) ||
                p.targetId?.toLowerCase().includes(query) ||
                p.sourceMac?.toLowerCase().includes(query) ||
                p.destinationMac?.toLowerCase().includes(query)
            )
        }
        return true
    }).reverse()

    return (
        <div className="packet-sniffer-panel panel-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '100%', overflow: 'hidden' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Packet Sniffer</h3>
                <button className="btn btn-danger btn-sm" onClick={clearPackets}>Clear Capture</button>
            </div>

            <div className="sniffer-controls" style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="form-select" value={filterProtocol} onChange={(e) => setFilterProtocol(e.target.value)}>
                    <option value="ALL">All Protocols</option>
                    <option value="ICMP">ICMP</option>
                    <option value="ARP">ARP</option>
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="STP">STP/BPDU</option>
                </select>
                <input 
                    className="form-input"
                    style={{ flex: 1 }}
                    type="text" 
                    placeholder="Search Node ID or MAC..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="packet-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {packetList.length === 0 && <p className="empty-text">No packets captured.</p>}
                {packetList.map((packet) => (
                    <div 
                        key={packet.id} 
                        className={`packet-item ${selectedPacket?.id === packet.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPacket(packet)}
                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', borderRadius: '4px', border: selectedPacket?.id === packet.id ? '1px solid #4ade80' : '1px solid transparent' }}
                    >
                        <span className="badge" style={{ backgroundColor: packet.color || '#333', marginRight: '0.5rem', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{packet.type}</span>
                        <span style={{ fontSize: '0.85rem' }}>{packet.sourceId || 'Unknown'} → {packet.targetId || 'Unknown'}</span>
                    </div>
                ))}
            </div>

            {selectedPacket && (
                <div className="packet-details" style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', marginTop: 'auto' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Frame Details: {selectedPacket.id?.substring(0,8)}...</h4>
                    <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div><strong>L2 Source:</strong> <br/>{selectedPacket.sourceMac || 'N/A'}</div>
                        <div><strong>L2 Dest:</strong> <br/>{selectedPacket.destinationMac || 'N/A'}</div>
                        <div><strong>VLAN:</strong> {selectedPacket.vlan || 1}</div>
                        <div><strong>Protocol:</strong> {selectedPacket.type}</div>
                        {selectedPacket.isBroadcast && <div style={{ color: '#f59e0b' }}><strong>Broadcast Frame</strong></div>}
                    </div>
                </div>
            )}
        </div>
    )
}

export default React.memo(PacketInspector)