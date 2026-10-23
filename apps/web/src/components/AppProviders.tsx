import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import type { LeadsApi } from "../api/leads";
import { LeadsApiContext } from "../api/LeadsApiContext";
import { createQueryClient } from "../api/queryClient";

interface AppProvidersProps {
  /** Defaults to the real API over HTTP. */
  api?: LeadsApi;
  /** Defaults to a fresh client, made once per mount. */
  queryClient?: QueryClient;
  children: ReactNode;
}

export function AppProviders({ api, queryClient, children }: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  const content = api ? (
    <LeadsApiContext.Provider value={api}>{children}</LeadsApiContext.Provider>
  ) : (
    children
  );
  return <QueryClientProvider client={client}>{content}</QueryClientProvider>;
}
