import type { ReactNode } from "react";
import type { AuthApi } from "../api/auth";
import type { LeadsApi } from "../api/leads";
import { createSampleAuthApi } from "../api/sampleAuthApi";
import { createQueryClient } from "../api/queryClient";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { AppProviders } from "../components/AppProviders";

/**
 * A wrapper for render and renderHook: `api` (the sample leads by default), `authApi` (signed in
 * as the sample user by default), a fresh cache and no retries.
 */
export function providers(
  api: LeadsApi = createSampleLeadsApi(),
  authApi: AuthApi = createSampleAuthApi(),
) {
  const queryClient = createQueryClient({ retry: false });
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <AppProviders api={api} authApi={authApi} queryClient={queryClient}>
        {children}
      </AppProviders>
    );
  };
}
