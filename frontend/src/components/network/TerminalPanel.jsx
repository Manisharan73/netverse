import { useEffect, useRef } from 'react'

export default function TerminalPanel({ logs }) {
    const terminalRef = useRef(null)

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
                    logs.map((log, index) => (
                        <div
                            key={index}
                            className={`terminal-line ${log.includes('timed out') ? 'terminal-error' : 'terminal-success'}`}
                        >
                            {log}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
