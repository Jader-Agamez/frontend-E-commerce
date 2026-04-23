import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', cls: 'badge-warning' },
  paid: { label: 'Pagado', cls: 'badge-info' },
  processing: { label: 'Procesando', cls: 'badge-info' },
  shipped: { label: 'Enviado', cls: 'badge-info' },
  delivered: { label: 'Entregado', cls: 'badge-success' },
  cancelled: { label: 'Cancelado', cls: 'badge-danger' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getOne(id)
      .then(({ data }) => setOrder(data))
      .catch(() => navigate('/profile'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="spinner" />;
  if (!order) return null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>← Volver</button>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Pedido #{order.id}</h1>
            <span className={`badge ${STATUS_LABELS[order.status]?.cls}`} style={{ fontSize: '.9rem', padding: '.4rem 1rem' }}>
              {STATUS_LABELS[order.status]?.label}
            </span>
          </div>

          <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
            <div>
              <p style={{ color: 'var(--gray)', fontSize: '.85rem' }}>Fecha</p>
              <p style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleString('es-ES')}</p>
            </div>
            <div>
              <p style={{ color: 'var(--gray)', fontSize: '.85rem' }}>Método de pago</p>
              <p style={{ fontWeight: 600 }}>{order.paymentMethod} — {order.paymentId}</p>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <p style={{ color: 'var(--gray)', fontSize: '.85rem' }}>Dirección de envío</p>
              <p style={{ fontWeight: 600 }}>{order.shippingAddress}</p>
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Productos</h3>
          <table>
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unit.</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.name}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td style={{ fontWeight: 700 }}>${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'right', marginTop: '1.5rem', fontSize: '1.3rem', fontWeight: 900 }}>
            Total: <span style={{ color: 'var(--primary)' }}>${parseFloat(order.total).toFixed(2)}</span>
          </div>

          {order.invoicePath && (
            <div style={{ marginTop: '1.5rem' }}>
              <a
                href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/invoices/invoice-${order.id}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                📄 Descargar factura PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
