// ShoppingCartContext.js
import { useState, useEffect, createContext, useContext } from "react";

import useLocalStorage from "~/utils/useLocalStorage";
import ShoppingCart from "~/utils/ShoppingCart";

const ShoppingCartInstance = new ShoppingCart();
const ShoppingCartContext = createContext(ShoppingCartInstance);

export const ShoppingCartProvider = ({ children }) => {
    const [localCart = '', setLocalCart] = useLocalStorage("cart");
    const [shoppingCart, setShoppingCart] = useState(ShoppingCartInstance);
    shoppingCart.setUIStateHandler(setLocalCart);

    // Update shopping cart
    useEffect(() => {
        (async () => {
        //
        if (!localCart || localCart == "") {
            return;
        }

        // Sync ShoppingCart object with localstorage data
        const parsedCart = JSON.parse(localCart);
        console.log(parsedCart, "parsedCart")
        setShoppingCart(new ShoppingCart(parsedCart));
        })();
    }, [localCart]); // empty dependency array means this effect runs only once, similar to componentDidMount

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
