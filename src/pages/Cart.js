import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, total, updateItem, removeItem, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const handleUpdate = async (id, qty) => {
    try { await updateItem(id, qty); }
    catch { toast.error('Error al actualizar'); }
  };

  const handleRemove = async (id) => {
    try { await removeItem(id); toast.success('Eliminado'); }
    catch { toast.error('Error al eliminar'); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">🛒 Mi Carrito</h1>

        {items.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--gray)', marginBottom: '1.2rem' }}>Tu carrito está vacío</p>
            <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Ver productos</button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="card">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.product?.image || 'https://via.placeholder.com/80'} alt={item.product?.name} />
                  <div className="cart-item-info">
                    <h4>{item.product?.name}</h4>
                    <p className="price">${parseFloat(item.product?.price || 0).toFixed(2)}</p>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => handleUpdate(item.id, item.quantity - 1)}>−</button>
                        <span style={{ fontWeight: 700, minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <span className="cart-item-subtotal">
                        ${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.id)}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '1rem', textAlign: 'right' }}>
                <button className="btn btn-outline btn-sm" onClick={clearCart}>Vaciar carrito</button>
              </div>
            </div>

            {/* Summary */}
            <div className="card cart-summary">
              <h3 style={{ marginBottom: '1.2rem', fontWeight: 800 }}>Resumen del pedido</h3>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', fontSize: '.88rem' }}>
                  <span style={{ color: 'var(--gray)' }}>{item.product?.name} ×{item.quantity}</span>
                  <span>${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.15rem', marginBottom: '1.2rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>
                Proceder al pago →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
