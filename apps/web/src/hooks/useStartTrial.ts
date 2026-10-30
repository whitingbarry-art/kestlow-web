import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useLeadsApi } from "../api/LeadsApiContext";
import { SUBSCRIPTION_KEY, useSubscription } from "./useSubscription";
import { useSession } from "./useSession";

/**
 * Starts the free Pro trial (KES-49) as soon as someone can have it: their email is confirmed and
 * they've never had one. Onboarding usually ends before the email is confirmed, so this runs
 * whenever the app opens, not only then. It asks once per page load; a failure waits for the
 * next, and the pricing page offers the trial too.
 */
export function useStartTrial() {
  const api = useLeadsApi();
  const queryClient = useQueryClient();
  const confirmed = useSession().data?.emailVerified;
  const available = useSubscription().data?.trialAvailable;
  const asked = useRef(false);

  useEffect(() => {
    if (!confirmed || !available || asked.current) return;
    asked.current = true;
    api.startTrial().then(
      (subscription) => {
        if (subscription) queryClient.setQueryData(SUBSCRIPTION_KEY, subscription);
      },
      () => {},
    );
  }, [api, queryClient, confirmed, available]);
}
