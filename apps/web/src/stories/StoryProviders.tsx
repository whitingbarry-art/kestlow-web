import { useState, type ReactNode } from "react";
import type { LeadsApi } from "../api/leads";
import { createQueryClient } from "../api/queryClient";
import { AppProviders } from "../components/AppProviders";

/** The app's providers for one story: `api`, and a cache that lasts as long as the story. */
export function StoryProviders({ api, children }: { api: LeadsApi; children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient({ retry: false }));
  return (
    <AppProviders api={api} queryClient={queryClient}>
      {children}
    </AppProviders>
  );
}
