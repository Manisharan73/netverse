import React from 'react'
import useEventStore from '../../stores/event.store'

function EventTimeline() {
    const events = useEventStore((state) => state.events)

    return (
        <div className="event-timeline config-panel styled-scroll">
            <div className="panel-header">
                <h3>Event Timeline</h3>
                <span className="badge">{events.length} Events</span>
            </div>
            <div className="panel-section p-0">
                {events.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No events recorded</div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className={`event-item border-b border-gray-800 p-3 flex flex-col gap-1 event-${event.severity?.toLowerCase() || 'info'}`}
                        >
                            <div className="flex justify-between items-center">
                                <strong className="text-sm">[{event.type}]</strong>
                                <span className="event-time text-xs opacity-70">
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="event-message text-sm text-gray-300">
                                {event.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default React.memo(EventTimeline)