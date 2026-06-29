import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

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
    const savedWishlist = localStorage.getItem('app_wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  const saveWishlist = (items) => {
    setWishlistItems(items);
    localStorage.setItem('app_wishlist', JSON.stringify(items));
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);
    let newItems = [];

    if (exists) {
      newItems = wishlistItems.filter((item) => item.id !== product.id);
      addToast(`${product.name} removed from wishlist`, 'info');
    } else {
      newItems = [...wishlistItems, product];
      addToast(`${product.name} added to wishlist!`, 'success');
    }

    saveWishlist(newItems);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
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
