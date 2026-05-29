import React, { useEffect, useRef } from 'react'
import useEventStore from '../../stores/event.store'

export default React.memo(function TerminalPanel() {
    const terminalRef = useRef(null)
    const events = useEventStore((state) => state.events)

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = 0
        }
    })

    return (
        <div className="terminal-panel">
            <div className="terminal-header">
                Network Terminal
            </div>

            <div className="terminal-body" ref={terminalRef}>
                {
                    events.map((event) => (
                        <div
                            key={event.id}
                            className={`terminal-line terminal-${event.severity.toLowerCase()}`}
                        >
                            <span className="terminal-time">[{new Date(event.timeStamp).toLocaleTimeString()}]</span>
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