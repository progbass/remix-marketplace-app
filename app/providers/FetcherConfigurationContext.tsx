// FetcherConfigurationContext.js
import React, { createContext, useContext } from 'react';

const FetcherConfigurationContext = createContext({fetch});

export const FetcherConfigurationProvider = ({ children, fetcher }) => {
  return (
    <FetcherConfigurationContext.Provider value={fetcher}>
      {children}
    </FetcherConfigurationContext.Provider>
  );
};

export { FetcherConfigurationContext };
export const useFetcherConfiguration = () => {
  return useContext(FetcherConfigurationContext);
};
