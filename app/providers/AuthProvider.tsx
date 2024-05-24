// ShoppingCartContext.js
import { useState, useEffect, createContext, useContext, useReducer } from "react";


const AuthContext = createContext(null);
const AuthProvider = ({ children, currentUser }) => {
    // Export
    return (
        <AuthContext.Provider value={currentUser}>
            {children}
        </AuthContext.Provider>
    )
};

// Export
export default AuthProvider;
export const useAuth = () => {
  return useContext(AuthContext);
};