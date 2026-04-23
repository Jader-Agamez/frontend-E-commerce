import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>🛍️ ShopApp</Link>
        
        <button className={`nav-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <li><NavLink to="/catalog" onClick={closeMenu}>Catálogo</NavLink></li>
          {user ? (
            <>
              <li>
                <NavLink to="/cart" className="cart-badge" onClick={closeMenu}>
                  🛒 Carrito {count > 0 && <span className="count">{count}</span>}
                </NavLink>
              </li>
              <li><NavLink to="/profile" onClick={closeMenu}>Mi cuenta</NavLink></li>
              {isAdmin && <li><NavLink to="/admin" onClick={closeMenu}>Admin</NavLink></li>}
              <li>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Salir</button>
              </li>
            </>
          ) : (
            <>
              <li><NavLink to="/login" onClick={closeMenu}>Iniciar sesión</NavLink></li>
              <li><Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Registrarse</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
