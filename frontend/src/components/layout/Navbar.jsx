import useAuthStore from '../../stores/auth.store'

function Navbar({ saveStatus }) {
    const logout = useAuthStore((state) => state.logout)

    return(
        <>
            <div className="navbar">
                <h3>Realtime Internet Simulator</h3>

                <div className="navbar-right">
                    <span className="save-status">
                        {saveStatus}
                    </span>

                    <button onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}

export default Navbar