import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load from local storage for guests
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      } else {
        setCartItems([]);
      }
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await axios.get('/api/cart');
      setCartItems(res.data.items);
    } catch (err) {
      console.error('Error fetching cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await axios.post('/api/cart', { product_id: product.id, quantity });
        setCartItems(res.data.items);
      } catch (err) {
        console.error('Error adding to cart:', err.response?.data?.message || err.message);
        throw new Error(err.response?.data?.message || 'Failed to add item to cart');
      } finally {
        setLoading(false);
      }
    } else {
      // Local cart storage for guest users
      const items = [...cartItems];
      const existingIdx = items.findIndex(item => item.product_id === product.id);
      
      if (existingIdx > -1) {
        items[existingIdx].quantity += quantity;
      } else {
        items.push({
          id: `local_${Date.now()}`,
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock: product.stock,
          quantity
        });
      }
      
      setCartItems(items);
      localStorage.setItem('cart', JSON.stringify(items));
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await axios.put(`/api/cart/${cartItemId}`, { quantity });
        await fetchCart();
      } catch (err) {
        console.error('Error updating quantity:', err.response?.data?.message || err.message);
        throw new Error(err.response?.data?.message || 'Failed to update quantity');
      } finally {
        setLoading(false);
      }
    } else {
      const items = cartItems.map(item => {
        if (item.id === cartItemId) {
          return { ...item, quantity };
        }
        return item;
      });
      setCartItems(items);
      localStorage.setItem('cart', JSON.stringify(items));
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await axios.delete(`/api/cart/${cartItemId}`);
        await fetchCart();
      } catch (err) {
        console.error('Error removing item:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      const items = cartItems.filter(item => item.id !== cartItemId);
      setCartItems(items);
      localStorage.setItem('cart', JSON.stringify(items));
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, updateQuantity, removeFromCart, clearCart, getCartCount, getCartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
