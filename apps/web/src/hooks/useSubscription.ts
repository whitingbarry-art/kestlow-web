import { queryOptions, useQuery } from "@tanstack/react-query";
import { useLeadsApi } from "../api/LeadsApiContext";
import type { LeadsApi } from "../api/leads";

/** Someone's plan, shared by the trial banner, the pricing page and Account (KES-49, KES-50). */
export const SUBSCRIPTION_KEY = ["subscription"] as const;

export const subscriptionQuery = (api: LeadsApi) =>
  queryOptions({ queryKey: SUBSCRIPTION_KEY, queryFn: () => api.getSubscription() });

export function useSubscription() {
  return useQuery(subscriptionQuery(useLeadsApi()));
}
