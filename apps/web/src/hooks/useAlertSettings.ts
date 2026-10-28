import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useLeadsApi } from "../api/LeadsApiContext";
import {
  DELIVERY_OPTIONS,
  DISTANCE_MAX_MILES,
  DISTANCE_MIN_MILES,
  INITIAL_DELIVERY,
  INITIAL_DISTANCE_MILES,
  INITIAL_TRADES,
} from "../data/alerts";
import { TRADES } from "../data/leads";
import { clamp, formatDistance } from "../logic/alerts";
import type { DeliveryChannel } from "../types/alerts";
import type { Trade } from "../types/lead";

/** The base postcode leads are measured from (KES-26). */
export const BASE_POSTCODE_KEY = ["base-postcode"] as const;

// Every query whose distances come from the base postcode.
const MEASURED_FROM_BASE = new Set(["leads", "lead", "saved"]);

export function useAlertSettings() {
  const api = useLeadsApi();
  const queryClient = useQueryClient();
  const baseQuery = useQuery({ queryKey: BASE_POSTCODE_KEY, queryFn: () => api.getBasePostcode() });
  const { mutateAsync: saveBasePostcode } = useMutation({
    mutationFn: (postcode: string) => api.setBasePostcode(postcode),
    onSuccess: (result) => {
      if (!result.ok) return;
      queryClient.setQueryData(BASE_POSTCODE_KEY, result.postcode);
      // Leads are now measured from somewhere else, so fetch them again (in the background).
      void queryClient.invalidateQueries({
        predicate: (query) => MEASURED_FROM_BASE.has(String(query.queryKey[0])),
      });
    },
  });
  const [delivery, setDelivery] = useState(INITIAL_DELIVERY);
  const [trades, setTrades] = useState(INITIAL_TRADES);
  const [distance, setDistanceState] = useState(INITIAL_DISTANCE_MILES);

  const toggleDelivery = useCallback(
    (key: DeliveryChannel) => setDelivery((current) => ({ ...current, [key]: !current[key] })),
    [],
  );

  const toggleTrade = useCallback(
    (trade: Trade) => setTrades((current) => ({ ...current, [trade]: !current[trade] })),
    [],
  );

  const setDistance = useCallback(
    (miles: number) => setDistanceState(clamp(miles, DISTANCE_MIN_MILES, DISTANCE_MAX_MILES)),
    [],
  );

  return {
    deliveryOptions: DELIVERY_OPTIONS,
    delivery,
    toggleDelivery,
    tradeOptions: TRADES,
    trades,
    toggleTrade,
    distance,
    distanceLabel: formatDistance(distance),
    distanceMin: DISTANCE_MIN_MILES,
    distanceMax: DISTANCE_MAX_MILES,
    setDistance,
    basePostcode: baseQuery.data ?? null,
    basePostcodeLoaded: baseQuery.isSuccess,
    saveBasePostcode,
  };
}

export type AlertSettingsState = ReturnType<typeof useAlertSettings>;
