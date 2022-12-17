import React, { useContext } from "react";

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
