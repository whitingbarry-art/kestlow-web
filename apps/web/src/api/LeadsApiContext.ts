import { createContext, useContext } from "react";
import { createHttpLeadsApi, type LeadsApi } from "./leads";

export const LeadsApiContext = createContext<LeadsApi>(createHttpLeadsApi());

export function useLeadsApi(): LeadsApi {
  return useContext(LeadsApiContext);
}
