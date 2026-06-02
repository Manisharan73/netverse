import React, { useState, useEffect } from 'react'

export default function SaveNetworkModal({ isOpen, onClose, onSave, initialName, initialDescription }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        if (isOpen) {
            setName(initialName || '')
            setDescription(initialDescription || '')
        }
    }, [isOpen, initialName, initialDescription])

    if (!isOpen) return null

    const handleSave = () => {
        onSave(name, description)
        onClose()
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
                width: '400px',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-dark)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <h2 style={{ margin: 0, color: '#fff' }}>Save Network</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Network Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="My Awesome Network"
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-dark)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Description</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Description of the topology..."
                        rows={4}
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-dark)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: '#fff',
                            outline: 'none',
                            resize: 'none'
                        }}
                    />
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
                        onClick={handleSave}
                        disabled={!name.trim()}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: name.trim() ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)',
                            color: '#fff',
                            cursor: name.trim() ? 'pointer' : 'not-allowed',
                            fontWeight: 500
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
