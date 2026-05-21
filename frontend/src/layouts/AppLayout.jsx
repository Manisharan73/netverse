import Navbar from "../components/layout/Navbar"
import Sidebar from '../components/layout/Sidebar'

function AppLayout({ children, saveStatus }) {
    return(
        <>
            <div className="app-layout">
                <Sidebar />

                <div className="main-content">
                    <Navbar saveStatus={ saveStatus }/>

                    <div className="page-content">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AppLayout