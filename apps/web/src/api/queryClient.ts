import { QueryClient } from "@tanstack/react-query";

/** Leads change once a night, so a minute's caching is plenty; one retry rides out a blip. */
export function createQueryClient({ retry = 1 }: { retry?: number | false } = {}): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry } },
  });
}
