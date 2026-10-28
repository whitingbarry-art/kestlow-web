import { createContext, useContext } from "react";
import { createHttpAuthApi, type AuthApi } from "./auth";

export const AuthApiContext = createContext<AuthApi>(createHttpAuthApi());

export function useAuthApi(): AuthApi {
  return useContext(AuthApiContext);
}
