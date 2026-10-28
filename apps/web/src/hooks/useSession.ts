import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthApi } from "../api/AuthApiContext";

export const SESSION_KEY = ["me"] as const;

/** Who's signed in: `data` is the user, or null when nobody is. */
export function useSession() {
  const api = useAuthApi();
  return useQuery({ queryKey: SESSION_KEY, queryFn: () => api.getMe(), staleTime: Infinity });
}

/** Forgets the signed-in user and everything cached for them, such as their leads. */
function useForgetUser() {
  const queryClient = useQueryClient();
  return () => {
    // Keep the session query itself: the gate is watching it, and removing it would leave the
    // gate on a query that no longer gets updates.
    queryClient.setQueryData(SESSION_KEY, null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== SESSION_KEY[0] });
  };
}

/** Signs out, and forgets everything cached for that user. */
export function useSignOut() {
  const api = useAuthApi();
  const forgetUser = useForgetUser();
  return useMutation({ mutationFn: () => api.signOut(), onSuccess: forgetUser });
}

/** Signs out of every device, this one included (KES-43). */
export function useSignOutEverywhere() {
  const api = useAuthApi();
  const forgetUser = useForgetUser();
  return useMutation({ mutationFn: () => api.signOutEverywhere(), onSuccess: forgetUser });
}

/** Deletes the account once the password checks out, then shows the sign-in screen (KES-43). */
export function useDeleteAccount() {
  const api = useAuthApi();
  const forgetUser = useForgetUser();
  return useMutation({
    mutationFn: (password: string) => api.deleteAccount(password),
    onSuccess: (result) => {
      if (result.ok) forgetUser();
    },
  });
}
