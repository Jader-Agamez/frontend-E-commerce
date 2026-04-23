import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    try {
      await addItem(product.id, 1);
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar');
    }
  };

  return (
    <div className="card product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <img
        src={product.image || 'https://via.placeholder.com/400x220?text=Producto'}
        alt={product.name}
      />
      <div className="card-body">
        <p className="category">{product.category?.name}</p>
        <h3>{product.name}</h3>
        <p className="price">${parseFloat(product.price).toFixed(2)}</p>
        <p className="stock">{product.stock > 0 ? `✓ ${product.stock} disponibles` : '✗ Sin stock'}</p>
        <button
          className="btn btn-primary btn-sm btn-full"
          style={{ marginTop: '.8rem' }}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Sin stock' : '+ Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
