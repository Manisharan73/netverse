import useAuthStore from '../../stores/auth.store'

function Navbar() {
    const logout = useAuthStore((state) => state.logout)

    return(
        <>
            <div className="navbar">
                <h3>Realtime Internet Simulator</h3>

                <button onClick={logout}>
                    Logout
                </button>
            </div>
        </>
    )
}

export default Navbar