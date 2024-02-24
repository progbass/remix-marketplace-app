// ShoppingCartContext.js
import { useState, useEffect, createContext, useContext } from "react";

import ShoppingCart, { ShoppingCartType } from "~/utils/ShoppingCart";

const ShoppingCartInstance = new ShoppingCart();
const ShoppingCartContext = createContext(ShoppingCartInstance);

export const ShoppingCartProvider = ({ children, items }) => {
  const [shoppingCart, setShoppingCart] = useState(ShoppingCartInstance);
  console.log('provider init ', items)
  shoppingCart.setCart(items);

  useEffect(() => {
    const unsubscribe = shoppingCart.subscribe((currentCart:ShoppingCartType) => {
      // Trigger a re-render when the items property is updated
      // unsubscribe()
      console.log('----------------------------------------------------------')
      // shoppingCart.clear();
      const updatedShoppingCart = new ShoppingCart(currentCart);
      console.log('actualizando desde el provider inside', currentCart, updatedShoppingCart)
      console.log('----------------------------------------------------------')
      setShoppingCart(updatedShoppingCart);
    });

    return () => unsubscribe();
  }, [shoppingCart]);

//
  return (
    <ShoppingCartContext.Provider value={shoppingCart}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export { ShoppingCartContext };
export const useShoppingCart = () => {
  return useContext(ShoppingCartContext);
};
