import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthApi } from "../api/AuthApiContext";

export const SESSION_KEY = ["me"] as const;

/** Who's signed in: `data` is the user, or null when nobody is. */
export function useSession() {
  const api = useAuthApi();
  return useQuery({ queryKey: SESSION_KEY, queryFn: () => api.getMe(), staleTime: Infinity });
}

/** Signs out, and forgets everything cached for that user, such as their leads. */
export function useSignOut() {
  const api = useAuthApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.signOut(),
    onSuccess: () => {
      // Keep the session query itself: the gate is watching it, and removing it would leave the
      // gate on a query that no longer gets updates.
      queryClient.setQueryData(SESSION_KEY, null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== SESSION_KEY[0] });
    },
  });
}
