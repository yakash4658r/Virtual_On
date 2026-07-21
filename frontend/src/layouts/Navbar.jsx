import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiUser, FiLogOut, FiSettings } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { APP_NAME } from '../utils/constants'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
           {APP_NAME}
        </Link>

        <div className="nav-links">
          <Link to="/catalog" className="nav-link">Catalog</Link>

          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <>
                  <Link to="/cart" className="nav-link cart-link">
                    <FiShoppingBag />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </Link>

                  <Link to="/tryon" className="nav-link">
                    Try On
                  </Link>
                </>
              )}

              {user?.role === 'store_admin' && (
                <Link to="/admin" className="nav-link">
                  <FiSettings />
                  <span>Admin</span>
                </Link>
              )}
              {user?.role === 'super_admin' && (
                <Link to="/superadmin" className="nav-link">
                  <FiSettings />
                  <span>Super Admin</span>
                </Link>
              )}

              <div className="nav-user">
                <FiUser />
                <span>{user?.name}</span>
              </div>

              <button className="nav-logout" onClick={handleLogout}>
                <FiLogOut />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn-register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar