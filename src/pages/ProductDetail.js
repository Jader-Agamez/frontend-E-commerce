import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI.getOne(id)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    if (!user) return navigate('/login');
    try {
      await addItem(product.id, qty);
      toast.success('Agregado al carrito');
    } catch { toast.error('Error al agregar'); }
  };

  if (loading) return <div className="spinner" />;
  if (!product) return null;

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}
          style={{ marginBottom: '1.2rem' }}>← Volver</button>

        <div className="card">
          <div className="product-detail-layout" style={{ padding: '1.2rem' }}>

            <img
              className="product-detail-img"
              src={product.image || 'https://via.placeholder.com/600x400?text=Producto'}
              alt={product.name}
            />

            <div className="product-detail-info">
              <span className="badge badge-info">{product.category?.name}</span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '.8rem 0 .5rem' }}>{product.name}</h1>
              <p style={{ color: 'var(--gray)', marginBottom: '1rem', lineHeight: 1.7, fontSize: '.95rem' }}>
                {product.description}
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '.6rem' }}>
                ${parseFloat(product.price).toFixed(2)}
              </p>
              <p style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', marginBottom: '1.2rem', fontWeight: 600, fontSize: '.9rem' }}>
                {product.stock > 0 ? `✓ ${product.stock} en stock` : '✗ Sin stock'}
              </p>

              {product.stock > 0 && (
                <div style={{ display: 'flex', gap: '.8rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <span style={{ fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={handleAdd} style={{ flex: 1, minWidth: '160px' }}>
                    🛒 Agregar al carrito
                  </button>
                </div>
              )}

              <p style={{ color: 'var(--gray)', fontSize: '.82rem' }}>SKU: {product.sku}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
