import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { api, isMockEnabled } from '../services/api';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('app_token');
      if (token && !isMockEnabled) {
        try {
          const res = await api.get('/auth/wishlist');
          if (res.data) {
            setWishlistItems(res.data);
            localStorage.setItem('app_wishlist', JSON.stringify(res.data));
            return;
          }
        } catch (e) {
          console.error('Failed to fetch wishlist', e);
        }
      }
      const savedWishlist = localStorage.getItem('app_wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    };
    fetchWishlist();
  }, []);

  const saveWishlist = async (items) => {
    setWishlistItems(items);
    localStorage.setItem('app_wishlist', JSON.stringify(items));

    const token = localStorage.getItem('app_token');
    if (token && !isMockEnabled) {
      try {
        await api.put('/auth/wishlist', { wishlist: items });
      } catch (e) {
        console.error('Failed to sync wishlist', e);
      }
    }
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => (item.id || item._id) === (product.id || product._id));
    let newItems = [];

    if (exists) {
      newItems = wishlistItems.filter((item) => (item.id || item._id) !== (product.id || product._id));
      addToast(`${product.name} removed from wishlist`, 'info');
    } else {
      newItems = [...wishlistItems, product];
      addToast(`${product.name} added to wishlist!`, 'success');
    }

    saveWishlist(newItems);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item.id || item._id) === productId);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
