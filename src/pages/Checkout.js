import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: user?.address || '',
    cardNumber: '',
    cardHolder: user?.name || '',
    cardExpiry: '',
    cardCvv: '',
    notes: '',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shippingAddress) return toast.error('Dirección requerida');
    if (form.cardNumber.replace(/\s/g, '').length < 16) return toast.error('Número de tarjeta inválido');
    setLoading(true);
    try {
      const { data } = await ordersAPI.create({
        shippingAddress: form.shippingAddress,
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        cardHolder: form.cardHolder,
        notes: form.notes,
      });
      toast.success('¡Pedido confirmado! 🎉');
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar el pago');
    } finally { setLoading(false); }
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">💳 Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">

            {/* Formularios */}
            <div>
              <div className="card" style={{ padding: '1.2rem', marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Dirección de envío</h3>
                <div className="form-group">
                  <label>Dirección completa</label>
                  <textarea className="form-control" name="shippingAddress" rows={3}
                    value={form.shippingAddress} onChange={handleChange} required
                    placeholder="Calle, número, ciudad, país..." />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Notas (opcional)</label>
                  <input className="form-control" name="notes" value={form.notes}
                    onChange={handleChange} placeholder="Instrucciones especiales..." />
                </div>
              </div>

              <div className="card" style={{ padding: '1.2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Información de pago</h3>
                <div className="form-group">
                  <label>Número de tarjeta</label>
                  <input className="form-control" name="cardNumber" value={form.cardNumber}
                    onChange={handleChange} placeholder="1234 5678 9012 3456" maxLength={19} required
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim(); }} />
                  <small style={{ color: 'var(--gray)', fontSize: '.78rem' }}>
                    Usa 4000000000000002 para simular rechazo
                  </small>
                </div>
                <div className="form-group">
                  <label>Titular</label>
                  <input className="form-control" name="cardHolder" value={form.cardHolder}
                    onChange={handleChange} required />
                </div>
                <div className="grid grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Vencimiento</label>
                    <input className="form-control" name="cardExpiry" value={form.cardExpiry}
                      onChange={handleChange} placeholder="MM/AA" maxLength={5} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>CVV</label>
                    <input className="form-control" name="cardCvv" value={form.cardCvv}
                      onChange={handleChange} placeholder="123" maxLength={4} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="card checkout-summary">
              <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Resumen</h3>
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
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? '⏳ Procesando...' : '✓ Confirmar pedido'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
