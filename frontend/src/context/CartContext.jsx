import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { api, isMockEnabled } from '../services/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('app_token');
      if (token && !isMockEnabled) {
        try {
          const res = await api.get('/auth/cart');
          if (res.data) {
            const formatted = res.data.map(item => ({ product: item.product, quantity: item.quantity, variant: item.variant }));
            setCartItems(formatted);
            localStorage.setItem('app_cart', JSON.stringify(formatted));
            return;
          }
        } catch (e) {
          console.error('Failed to fetch cart', e);
        }
      }
      const savedCart = localStorage.getItem('app_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    };
    fetchCart();
  }, []);

  const saveCart = async (items) => {
    setCartItems(items);
    localStorage.setItem('app_cart', JSON.stringify(items));
    
    const token = localStorage.getItem('app_token');
    if (token && !isMockEnabled) {
      try {
        await api.put('/auth/cart', { cartItems: items });
      } catch (e) {
        console.error('Failed to sync cart', e);
      }
    }
  };

  const addToCart = (product, quantity = 1, variant = null) => {
    const pId = product.id || product._id;
    const existingIndex = cartItems.findIndex((item) => (item.product.id || item.product._id) === pId && item.variant === variant);
    let newItems = [...cartItems];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ product, quantity, variant });
    }

    saveCart(newItems);
    addToast(`${product.name} ${variant ? `(${variant}) ` : ''}added to cart!`, 'success');
  };

  const removeFromCart = (productId, variant = null) => {
    const filtered = cartItems.filter((item) => !((item.product.id || item.product._id) === productId && item.variant === variant));
    saveCart(filtered);
    addToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, quantity, variant = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    const updated = cartItems.map((item) =>
      ((item.product.id || item.product._id) === productId && item.variant === variant) ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
  };

  const applyCoupon = (code) => {
    // Simple mock coupon evaluation
    const upperCode = code.toUpperCase();
    if (upperCode === 'SAVE10') {
      setCoupon({ code: 'SAVE10', discount: 10, type: 'percentage' });
      addToast('Coupon SAVE10 applied! 10% discount.', 'success');
      return true;
    } else if (upperCode === 'WELCOME20') {
      setCoupon({ code: 'WELCOME20', discount: 20, type: 'flat' });
      addToast('Coupon WELCOME20 applied! $20 discount.', 'success');
      return true;
    }
    addToast('Invalid coupon code', 'error');
    return false;
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Coupon removed', 'info');
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.price * (1 - (item.product.discount || 0) / 100);
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = coupon
    ? coupon.type === 'percentage'
      ? (subtotal * coupon.discount) / 100
      : coupon.discount
    : 0;

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
