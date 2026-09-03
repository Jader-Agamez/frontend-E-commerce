import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('¡Suscrito correctamente!');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>🛍️ ShopApp</h3>
            <p>Tu tienda en línea de confianza. Compra con seguridad y recibe en la comodidad de tu hogar.</p>
          </div>

          <div className="footer-col">
            <h4>Categorías</h4>
            <ul>
              <li><Link to="/catalog?category=1">Electrónica</Link></li>
              <li><Link to="/catalog?category=2">Ropa</Link></li>
              <li><Link to="/catalog?category=3">Hogar</Link></li>
              <li><Link to="/catalog">Ver todo</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Información</h4>
            <ul>
              <li><Link to="/catalog">Catálogo</Link></li>
              <li><Link to="/profile">Mi cuenta</Link></li>
              <li><Link to="/cart">Carrito</Link></li>
              <li><Link to="/login">Iniciar sesión</Link></li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4>Newsletter</h4>
            <p>Suscríbete para descuentos exclusivos y nuevas colecciones.</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">Suscribirse</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopApp - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}
