import React, { useEffect, useRef } from 'react'
import useEventStore from '../../stores/event.store'

export default React.memo(function TerminalPanel() {
    const terminalRef = useRef(null)
    const events = useEventStore((state) => state.events)

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = 0
        }
    }, [events])

    return (
        <div className="terminal-panel styled-scroll">
            <div className="panel-header">
                <h3>Network Terminal</h3>
            </div>

            <div className="terminal-body font-mono text-sm" ref={terminalRef}>
                {
                    events.map((event) => (
                        <div
                            key={event.id}
                            className={`terminal-line terminal-${event.severity?.toLowerCase() || 'info'}`}
                        >
                            <span className="terminal-time opacity-70">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                            {' '}
                            <span className="terminal-type">[{event.type}]</span>
                            {' '}
                            <span className="terminal-message">{event.message}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
})