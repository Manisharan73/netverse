export default function IncidentsPanel({ incidents }) {
    return (
        <div className="incident-panel">
            <div className="incident-header">
                Incidents
            </div>

            <div className="incident-body">
                {
                    incidents.map((incident) => (
                        <div
                            key={incident.id}
                            className={`incident-card ${incident.severity.toLowerCase()}`}
                        >
                            <div>
                                {incident.severity}
                            </div>

                            <div>
                                {incident.node}
                            </div>

                            <div>
                                {incident.issue}
                            </div>

                            <div>
                                {incident.timestamp}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
