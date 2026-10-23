import type { ReactNode } from "react";
import type { LeadsApi } from "../api/leads";
import { createQueryClient } from "../api/queryClient";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { AppProviders } from "../components/AppProviders";

/** A wrapper for render and renderHook: `api` (the sample leads by default), a fresh cache and no retries. */
export function providers(api: LeadsApi = createSampleLeadsApi()) {
  const queryClient = createQueryClient({ retry: false });
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <AppProviders api={api} queryClient={queryClient}>
        {children}
      </AppProviders>
    );
  };
}
