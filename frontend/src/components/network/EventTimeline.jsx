import React from 'react'
import useEventStore from '../../stores/event.store'

function EventTimeline() {
    const events = useEventStore((state) => state.events)

    return (
        <div className="event-timeline">
            <h3>Network Events</h3>

            {
                events.map((event) => (
                    <div
                        key={event.id}
                        className={`event-item event-${event.severity.toLowerCase()}`}
                    >
                        <div className="event-time">
                            {new Date(event.timestamp).toLocaleTimeString()}
                        </div>

                        <div className="event-message">
                            [{event.type}]
                            {' '}
                            {event.message}
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default React.memo(EventTimeline)