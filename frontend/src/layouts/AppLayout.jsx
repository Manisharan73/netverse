import { useState } from 'react'
import Navbar from "../components/layout/Navbar"
import Sidebar from '../components/layout/Sidebar'

function AppLayout({ children, saveStatus }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return(
        <>
            <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <div className="main-content">
                    <Navbar saveStatus={ saveStatus } />

                    <div className="page-content">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AppLayout