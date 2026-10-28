import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useLeadsApi } from "../../api/LeadsApiContext";
import { alertSettingsQuery } from "../../hooks/useAlertSettings";
import { ErrorState } from "../ui/ErrorState";
import { LoadingState } from "../ui/LoadingState";
import { Onboarding } from "./Onboarding";

interface OnboardingGateProps {
  children: ReactNode;
}

/**
 * Sends anyone without a base postcode through onboarding before the app (KES-44). The choice is
 * made once, from the settings as they first load: saving the postcode on step 1 mustn't end
 * onboarding before the trades and distance are asked.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const settings = useQuery(alertSettingsQuery(useLeadsApi()));
  const [onboarding, setOnboarding] = useState<boolean | null>(null);

  // Decided during render as soon as the settings arrive, so there's no flash of the app.
  if (onboarding === null && settings.data) setOnboarding(settings.data.postcode === null);

  if (settings.isError && onboarding === null)
    return (
      <ErrorState
        message="We couldn't reach Kestlow. Check your connection and try again."
        onRetry={() => void settings.refetch()}
      />
    );
  if (onboarding === null) return <LoadingState message="Getting your leads ready…" />;
  return onboarding ? <Onboarding onDone={() => setOnboarding(false)} /> : children;
}
