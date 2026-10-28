import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import type { AuthApi } from "../api/auth";
import { AuthApiContext } from "../api/AuthApiContext";
import type { LeadsApi } from "../api/leads";
import { LeadsApiContext } from "../api/LeadsApiContext";
import { createQueryClient } from "../api/queryClient";

interface AppProvidersProps {
  /** Defaults to the real API over HTTP. */
  api?: LeadsApi;
  /** Defaults to accounts over HTTP. */
  authApi?: AuthApi;
  /** Defaults to a fresh client, made once per mount. */
  queryClient?: QueryClient;
  children: ReactNode;
}

export function AppProviders({ api, authApi, queryClient, children }: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  const withLeads = api ? (
    <LeadsApiContext.Provider value={api}>{children}</LeadsApiContext.Provider>
  ) : (
    children
  );
  const content = authApi ? (
    <AuthApiContext.Provider value={authApi}>{withLeads}</AuthApiContext.Provider>
  ) : (
    withLeads
  );
  return <QueryClientProvider client={client}>{content}</QueryClientProvider>;
}
