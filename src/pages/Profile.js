import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', cls: 'badge-warning' },
  paid: { label: 'Pagado', cls: 'badge-info' },
  processing: { label: 'Procesando', cls: 'badge-info' },
  shipped: { label: 'Enviado', cls: 'badge-info' },
  delivered: { label: 'Entregado', cls: 'badge-success' },
  cancelled: { label: 'Cancelado', cls: 'badge-danger' },
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === 'orders') ordersAPI.getMyOrders().then(({ data }) => setOrders(data));
  }, [tab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data);
      toast.success('Perfil actualizado');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>Mi cuenta</h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {['profile', 'orders'].map((t) => (
            <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
              {t === 'profile' ? '👤 Perfil' : '📦 Mis pedidos'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" value={user?.email} disabled style={{ background: '#f8fafc' }} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input className="form-control" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <textarea className="form-control" rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}

        {tab === 'orders' && (
          <div className="card">
            {orders.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray)' }}>No tienes pedidos aún</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>#</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th></tr></thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString('es-ES')}</td>
                        <td style={{ fontWeight: 700 }}>${parseFloat(o.total).toFixed(2)}</td>
                        <td><span className={`badge ${STATUS_LABELS[o.status]?.cls}`}>{STATUS_LABELS[o.status]?.label}</span></td>
                        <td><Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Ver</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
