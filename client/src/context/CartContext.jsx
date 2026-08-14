import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('veritus_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('veritus_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => {
      // Check if already in cart
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };
  
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeCart = () => setIsCartOpen(false);
  const openCart = () => setIsCartOpen(true);

  const cartTotal = cartItems.reduce((total, item) => total + (Number(item.price) || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal,
      isCartOpen,
      toggleCart,
      closeCart,
      openCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
