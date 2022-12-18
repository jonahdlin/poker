import React, { useContext, ProviderProps } from "react";

export type Environment = "production" | "development" | "test";

export class EnvironmentStore {
  get environment(): Environment {
    return process.env.NODE_ENV;
  }
}

export const EnvironmentContext = React.createContext(new EnvironmentStore());

export const useEnvironmentContext = () => {
  return useContext(EnvironmentContext);
};

export const EnvironmentProvider: React.FC<
  Omit<ProviderProps<EnvironmentStore>, "value"> & {
    value?: ProviderProps<EnvironmentStore>["value"];
  }
> = ({ children }) => {
  return (
    <EnvironmentContext.Provider value={new EnvironmentStore()}>
      {children}
    </EnvironmentContext.Provider>
  );
};
