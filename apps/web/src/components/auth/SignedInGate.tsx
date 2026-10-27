import type { ReactNode } from "react";
import { useSession } from "../../hooks/useSession";
import { ErrorState } from "../ui/ErrorState";
import { LoadingState } from "../ui/LoadingState";
import { AuthScreen } from "./AuthScreen";

interface SignedInGateProps {
  children: ReactNode;
}

/** Shows the app to signed-in people and the sign-in screen to everyone else (KES-23). */
export function SignedInGate({ children }: SignedInGateProps) {
  const session = useSession();

  if (session.isPending) return <LoadingState message="Checking you're signed in…" />;
  if (session.isError)
    return (
      <ErrorState
        message="We couldn't reach Kestlow. Check your connection and try again."
        onRetry={() => void session.refetch()}
      />
    );
  return session.data ? children : <AuthScreen />;
}
