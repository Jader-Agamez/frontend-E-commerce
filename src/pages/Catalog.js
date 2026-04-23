import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  useEffect(() => { categoriesAPI.getAll().then(({ data }) => setCategories(data)); }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await productsAPI.getAll(params);
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilter = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value, page: 1 }));

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Catálogo</h1>

        <div className="filters">
          <div className="form-group">
            <label>Buscar</label>
            <input className="form-control" name="search" placeholder="Nombre del producto..."
              value={filters.search} onChange={handleFilter} />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select className="form-control" name="categoryId" value={filters.categoryId} onChange={handleFilter}>
              <option value="">Todas</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Precio mín.</label>
            <input className="form-control" name="minPrice" type="number" placeholder="$0"
              value={filters.minPrice} onChange={handleFilter} />
          </div>
          <div className="form-group">
            <label>Precio máx.</label>
            <input className="form-control" name="maxPrice" type="number" placeholder="$9999"
              value={filters.maxPrice} onChange={handleFilter} />
          </div>
        </div>

        <p style={{ color: 'var(--gray)', marginBottom: '1rem', fontSize: '.9rem' }}>
          {pagination.total} productos encontrados
        </p>

        {loading ? <div className="spinner" /> : (
          <>
            <div className="grid grid-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {products.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '3rem' }}>
                No se encontraron productos
              </p>
            )}

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p}
                    className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  >{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
