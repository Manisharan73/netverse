import { Link } from 'react-router-dom'
import { FiMenu, FiX, FiMonitor, FiServer, FiActivity, FiBox } from 'react-icons/fi'

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', marginBottom: '36px' }}>
                {isOpen && <h2>NetVerse</h2>}
                <button onClick={toggleSidebar} className="btn-icon" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem', padding: '0' }}>
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            <nav>
                <Link to='/dashboard' title="Dashboard">
                    <FiActivity size={20} />
                    {isOpen && <span>Dashboard</span>}
                </Link>

                <Link to='/networks' title="Networks">
                    <FiMonitor size={20} />
                    {isOpen && <span>Networks</span>}
                </Link>

                <Link to="/servers" title="Servers">
                    <FiServer size={20} />
                    {isOpen && <span>Servers</span>}
                </Link>

                <Link to="/deployments" title="Deployments">
                    <FiBox size={20} />
                    {isOpen && <span>Deployments</span>}
                </Link>
            </nav>
        </div>
    )
}

export default Sidebar