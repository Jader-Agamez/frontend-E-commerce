import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_51U6bajRQuYIT7Sw0VLToErItNg9gsr2LVJYZUsHkdqS8Zlx4sOBqYHrV3EQcqdCEobQ6BLZNtcEd0qacxiKXPfKA00VaT4Vhex');

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#e53e3e' },
  },
};

function CheckoutForm() {
  const navigate = useNavigate();
  const { items, total } = useCart();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: user?.address || '',
    notes: '',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shippingAddress) return toast.error('Dirección requerida');
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: { name: user?.name },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const { data } = await ordersAPI.create({
        shippingAddress: form.shippingAddress,
        paymentMethodId: paymentMethod.id,
        notes: form.notes,
      });

      toast.success('¡Pedido confirmado! 🎉');
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">💳 Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
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
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Tarjeta de crédito / débito</label>
                  <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff' }}>
                    <CardElement options={CARD_STYLE} />
                  </div>
                  <small style={{ color: 'var(--gray)', fontSize: '.78rem' }}>
                    Prueba: <strong>4242 4242 4242 4242</strong> — cualquier fecha futura y CVV
                  </small>
                </div>
              </div>
            </div>

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
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || !stripe}>
                {loading ? '⏳ Procesando...' : '✓ Confirmar pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
