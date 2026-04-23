import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, ordersAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS = { pending: 'Pendiente', paid: 'Pagado', processing: 'Procesando', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };

export default function Admin() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', sku: '', categoryId: '', image: '' });

  const loadData = async () => {
    if (tab === 'products') {
      const [p, c] = await Promise.all([productsAPI.getAll({ limit: 100 }), categoriesAPI.getAll()]);
      setProducts(p.data.products);
      setCategories(c.data);
    } else if (tab === 'orders') {
      const { data } = await ordersAPI.getAll({ limit: 100 });
      setOrders(data.orders);
    } else if (tab === 'users') {
      const { data } = await usersAPI.getAll();
      setUsers(data);
    }
  };

  useEffect(() => { loadData(); }, [tab]);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) await productsAPI.update(editProduct.id, productForm);
      else await productsAPI.create(productForm);
      toast.success(editProduct ? 'Producto actualizado' : 'Producto creado');
      setShowForm(false);
      setEditProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', sku: '', categoryId: '', image: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setProductForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, sku: p.sku || '', categoryId: p.categoryId, image: p.image || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    await productsAPI.delete(id);
    toast.success('Eliminado');
    loadData();
  };

  const handleStatusChange = async (orderId, status) => {
    await ordersAPI.updateStatus(orderId, status);
    toast.success('Estado actualizado');
    loadData();
  };

  const handleToggleUser = async (user) => {
    await usersAPI.update(user.id, { ...user, isActive: !user.isActive });
    toast.success('Usuario actualizado');
    loadData();
  };

  const pf = (field) => (e) => setProductForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>⚙️ Panel de administración</h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {['products', 'orders', 'users'].map((t) => (
            <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
              {t === 'products' ? '🛍️ Productos' : t === 'orders' ? '📦 Pedidos' : '👥 Usuarios'}
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditProduct(null); setProductForm({ name: '', description: '', price: '', stock: '', sku: '', categoryId: '', image: '' }); }}>
                + Nuevo producto
              </button>
            </div>

            {showForm && (
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>{editProduct ? 'Editar producto' : 'Nuevo producto'}</h3>
                <form onSubmit={handleProductSubmit}>
                  <div className="grid grid-2">
                    <div className="form-group"><label>Nombre</label><input className="form-control" value={productForm.name} onChange={pf('name')} required /></div>
                    <div className="form-group"><label>SKU</label><input className="form-control" value={productForm.sku} onChange={pf('sku')} /></div>
                    <div className="form-group"><label>Precio</label><input className="form-control" type="number" step=".01" value={productForm.price} onChange={pf('price')} required /></div>
                    <div className="form-group"><label>Stock</label><input className="form-control" type="number" value={productForm.stock} onChange={pf('stock')} required /></div>
                    <div className="form-group">
                      <label>Categoría</label>
                      <select className="form-control" value={productForm.categoryId} onChange={pf('categoryId')} required>
                        <option value="">Seleccionar...</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Imagen URL</label><input className="form-control" value={productForm.image} onChange={pf('image')} /></div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Descripción</label><textarea className="form-control" rows={2} value={productForm.description} onChange={pf('description')} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary">{editProduct ? 'Actualizar' : 'Crear'}</button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="card table-wrapper">
              <table>
                <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category?.name}</td>
                      <td>${parseFloat(p.price).toFixed(2)}</td>
                      <td><span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{p.stock}</span></td>
                      <td style={{ display: 'flex', gap: '.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="card table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th><th>Cambiar estado</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.user?.name}<br /><small style={{ color: 'var(--gray)' }}>{o.user?.email}</small></td>
                    <td style={{ fontWeight: 700 }}>${parseFloat(o.total).toFixed(2)}</td>
                    <td><span className="badge badge-info">{STATUS_LABELS[o.status]}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString('es-ES')}</td>
                    <td>
                      <select className="form-control" style={{ padding: '.3rem .6rem', fontSize: '.85rem' }} value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="card table-wrapper">
            <table>
              <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-gray'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-outline'}`} onClick={() => handleToggleUser(u)}>
                        {u.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
