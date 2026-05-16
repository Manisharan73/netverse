import Navbar from "../components/layout/Navbar"
import Sidebar from '../components/layout/Sidebar'

function AppLayout({ children }) {
    return(
        <>
            <div className="app-layout">
                <Sidebar />

                <div className="main-content">
                    <Navbar />

                    <div className="page-content">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AppLayout