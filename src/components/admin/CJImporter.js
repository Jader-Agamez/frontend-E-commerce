import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CJImporter() {
  const [pid, setPid]         = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pid.trim()) return;
    setLoading(true);
    setProduct(null);
    setImported(false);
    try {
      const { data } = await api.get(`/cj/product/${pid.trim()}`);
      setProduct(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Producto no encontrado');
    } finally { setLoading(false); }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      await api.post('/cj/import', { pid: product.pid });
      toast.success('✅ Producto importado a tu tienda');
      setImported(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al importar');
    } finally { setImporting(false); }
  };

  const price = product?.sellPrice || product?.variants?.[0]?.sellPrice || 0;
  const stock = product?.variants?.reduce((s, v) => s + (v.variantStock || 0), 0) || 0;
  const image = product?.productImage || product?.productImageSet?.[0] || '';

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Buscador por código */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.3rem', color: '#1e293b' }}>
          Buscar producto por código CJ
        </div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
          Copia el PID del producto desde cjdropshipping.com → abre un producto → copia el número del campo <strong>"Product ID"</strong> o de la URL (<code>?id=...</code>)
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.8rem' }}>
          <input
            className="form-control"
            placeholder="Ej: 2608310858331623800"
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.5px' }}
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !pid.trim()}>
            {loading ? '...' : '🔍 Buscar'}
          </button>
        </form>
      </div>

      {/* Resultado */}
      {loading && <div className="spinner" />}

      {product && (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 0 }}>
            {/* Imagen */}
            <img
              src={image || 'https://via.placeholder.com/200x200?text=Sin+imagen'}
              alt={product.productNameEn}
              style={{ width: '100%', height: '100%', minHeight: 200, objectFit: 'cover' }}
            />
            {/* Info */}
            <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.categoryName}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                {product.productNameEn}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
                PID: {product.pid}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Precio</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#6366f1' }}>${parseFloat(price).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Stock</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: stock > 0 ? '#10b981' : '#ef4444' }}>{stock}</div>
                </div>
                {product.variants?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Variantes</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>{product.variants.length}</div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.8rem' }}>
                {imported ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700 }}>
                    ✅ Importado a tu tienda
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={importing}
                    style={{ width: '100%' }}
                  >
                    {importing ? 'Importando...' : '+ Importar a mi tienda'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
