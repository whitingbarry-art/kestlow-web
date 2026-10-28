import { QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./leads";

const isSignedOut = (error: unknown) => error instanceof ApiError && error.status === 401;

/** Leads change once a night, so a minute's caching is plenty; one retry rides out a blip. */
export function createQueryClient({ retry = 1 }: { retry?: number | false } = {}): QueryClient {
  const client: QueryClient = new QueryClient({
    // A 401 means the session has ended (expired, or signed out in another tab), so show the
    // sign-in screen rather than an error whose Retry can never work.
    queryCache: new QueryCache({
      onError: (error) => {
        if (isSignedOut(error)) client.setQueryData(["me"], null);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failures, error) => !isSignedOut(error) && failures < (retry || 0),
      },
    },
  });
  return client;
}
