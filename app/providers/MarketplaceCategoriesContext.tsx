// MarketplaceCategoriesContext.js
import React, { createContext, useContext } from 'react';

const MarketplaceCategoriesContext = createContext({fetch});

export const MarketplaceCategoriesProvider = ({ children, items }) => {
  return (
    <MarketplaceCategoriesContext.Provider value={items}>
      {children}
    </MarketplaceCategoriesContext.Provider>
  );
};

export { MarketplaceCategoriesContext };
export const useMarketplaceCategories = () => {
  return useContext(MarketplaceCategoriesContext);
};
