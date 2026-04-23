import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) return setItems([]);
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    await cartAPI.addItem({ productId, quantity });
    await fetchCart();
  };

  const updateItem = async (id, quantity) => {
    await cartAPI.updateItem(id, { quantity });
    await fetchCart();
  };

  const removeItem = async (id) => {
    await cartAPI.removeItem(id);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartAPI.clearCart();
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + parseFloat(i.product?.price || 0) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, total, count, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
