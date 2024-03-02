// ShoppingCartContext.js
import { useState, useEffect, createContext, useContext, useReducer } from "react";

import type { ShoppingCartType } from "~/utils/ShoppingCart";
import ShoppingCart from "~/utils/ShoppingCart";

const ShoppingCartInstance = new ShoppingCart();
const ShoppingCartContext = createContext(ShoppingCartInstance);

export const ShoppingCartProvider = (
  { children, items } : {children: any, items: ShoppingCartType}
) => {
  const [cart, setCart] = useState(new ShoppingCart(items));

  // Subscribe to changes
  useEffect(() => {
    console.log('inside the use effect');
    const unsubscribe = cart.subscribe((currentCart: ShoppingCartType) => {
      console.log('-------------> Context updating: ', currentCart);
      setCart(new ShoppingCart(currentCart));
    });

    return () => unsubscribe();
  }, [cart]);

  // Return the provider
  return (
    <ShoppingCartContext.Provider value={cart}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

// Export
export { ShoppingCartContext };
export const useShoppingCart = () => {
  return useContext(ShoppingCartContext);
};
