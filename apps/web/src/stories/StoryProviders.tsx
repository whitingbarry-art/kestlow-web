import { useState, type ReactNode } from "react";
import type { AuthApi } from "../api/auth";
import type { LeadsApi } from "../api/leads";
import { createSampleAuthApi } from "../api/sampleAuthApi";
import { createQueryClient } from "../api/queryClient";
import { AppProviders } from "../components/AppProviders";

/**
 * The app's providers for one story: `api`, `authApi` (signed in as the sample user unless
 * given), and a cache and accounts that last as long as the story.
 */
export function StoryProviders({
  api,
  authApi,
  children,
}: {
  api: LeadsApi;
  authApi?: AuthApi;
  children: ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient({ retry: false }));
  const [accounts] = useState(() => authApi ?? createSampleAuthApi());
  return (
    <AppProviders api={api} authApi={accounts} queryClient={queryClient}>
      {children}
    </AppProviders>
  );
}
