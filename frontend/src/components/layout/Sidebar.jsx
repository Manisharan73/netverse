import { Link } from 'react-router-dom'

function Sidebar() {
    return (
        <>
            <div className="sidebar">
                <h2>NetVerse</h2>

                <nav>
                    <Link to='/dashboard'>
                        Dashboard
                    </Link>

                    <Link to='/networks'>
                        Networks
                    </Link>

                    <Link to="/servers">
                        Servers
                    </Link>

                    <Link to="/deployments">
                        Deployments
                    </Link>
                </nav>
            </div>
        </>
    )
}

export default Sidebar