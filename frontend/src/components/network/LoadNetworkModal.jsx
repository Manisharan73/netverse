import React, { useState, useEffect } from 'react'
import { getNetwork } from '../../services/network.service'
import toast from 'react-hot-toast'

export default function LoadNetworkModal({ isOpen, onClose, onLoad }) {
    const [networks, setNetworks] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedNetworkId, setSelectedNetworkId] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchNetworks()
            setSelectedNetworkId(null)
        }
    }, [isOpen])

    const fetchNetworks = async () => {
        setLoading(true)
        try {
            const data = await getNetwork()
            setNetworks(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch networks')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const handleLoad = () => {
        if (selectedNetworkId) {
            onLoad(selectedNetworkId)
            onClose()
        }
    }

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content panel-dark" style={{
                width: '500px',
                maxHeight: '80vh',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-dark)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#fff' }}>Load Network</h2>
                    <button 
                        onClick={fetchNetworks}
                        style={{
                            background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px'
                        }}
                    >
                        Refresh
                    </button>
                </div>

                <div className="styled-scroll" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    overflowY: 'auto',
                    flex: 1,
                    minHeight: '200px',
                    border: '1px solid var(--border-dark)',
                    borderRadius: '8px',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    {loading ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Loading networks...</div>
                    ) : networks.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No saved networks found.</div>
                    ) : (
                        networks.map(net => (
                            <div 
                                key={net.id}
                                onClick={() => setSelectedNetworkId(net.id)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    border: `1px solid ${selectedNetworkId === net.id ? '#3b82f6' : 'transparent'}`,
                                    background: selectedNetworkId === net.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ color: '#fff', fontWeight: 500 }}>{net.name}</div>
                                {net.description && (
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                                        {net.description}
                                    </div>
                                )}
                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                                    Nodes: {net.Nodes?.length || 0} | Edges: {net.Edges?.length || 0}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-dark)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleLoad}
                        disabled={!selectedNetworkId}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: selectedNetworkId ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)',
                            color: '#fff',
                            cursor: selectedNetworkId ? 'pointer' : 'not-allowed',
                            fontWeight: 500
                        }}
                    >
                        Load
                    </button>
                </div>
            </div>
        </div>
    )
}
