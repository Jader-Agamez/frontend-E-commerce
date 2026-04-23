import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productsAPI.getAll({ limit: 8 }).then(({ data }) => setProducts(data.products));
    categoriesAPI.getAll().then(({ data }) => setCategories(data));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Descubre los mejores productos</h1>
          <p>Calidad, variedad y los mejores precios en un solo lugar</p>
          <Link to="/catalog" className="btn btn-secondary btn-lg">Ver catálogo →</Link>
        </div>
      </section>

      <div className="page">
        <div className="container">

          <h2 className="section-title">Categorías</h2>
          <div className="grid grid-4" style={{ marginBottom: '2.5rem' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?categoryId=${cat.id}`}
                className="card"
                style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}
              >
                📦 {cat.name}
              </Link>
            ))}
          </div>

          <h2 className="section-title">Productos destacados</h2>
          <div className="grid grid-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

        </div>
      </div>
    </>
  );
}
