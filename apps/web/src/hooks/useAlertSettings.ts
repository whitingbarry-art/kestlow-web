import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AlertSettingsChanges, BasePostcodeResult, LeadsApi } from "../api/leads";
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

/** The base postcode and distance leads are measured with (KES-26, KES-25). */
export const ALERT_SETTINGS_KEY = ["alert-settings"] as const;

/** The alert settings query, shared with useLeads, which shows the distance in its summary. */
export const alertSettingsQuery = (api: LeadsApi) => ({
  queryKey: ALERT_SETTINGS_KEY,
  queryFn: () => api.getAlertSettings(),
});

// Every query whose leads or distances depend on the base and distance.
const MEASURED_FROM_BASE = new Set(["leads", "lead", "saved"]);

/** The slider saves this long after it stops moving, so dragging doesn't send every mile. */
export const DISTANCE_SAVE_DELAY_MS = 500;

export function useAlertSettings() {
  const api = useLeadsApi();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery(alertSettingsQuery(api));
  const { mutateAsync: updateSettings } = useMutation({
    mutationFn: (changes: AlertSettingsChanges) => api.updateAlertSettings(changes),
    onSuccess: (result) => {
      if (!result.ok) return;
      queryClient.setQueryData(ALERT_SETTINGS_KEY, result.settings);
      // Leads are now measured differently, so fetch them again (in the background).
      void queryClient.invalidateQueries({
        predicate: (query) => MEASURED_FROM_BASE.has(String(query.queryKey[0])),
      });
    },
  });
  const [delivery, setDelivery] = useState(INITIAL_DELIVERY);
  const [trades, setTrades] = useState(INITIAL_TRADES);
  // The distance while the slider moves, until it's saved; null shows the saved one.
  const [draftDistance, setDraftDistance] = useState<number | null>(null);
  const pendingSave = useRef<{ timer: ReturnType<typeof setTimeout>; save: () => void } | null>(
    null,
  );

  const toggleDelivery = useCallback(
    (key: DeliveryChannel) => setDelivery((current) => ({ ...current, [key]: !current[key] })),
    [],
  );

  const toggleTrade = useCallback(
    (trade: Trade) => setTrades((current) => ({ ...current, [trade]: !current[trade] })),
    [],
  );

  const setDistance = useCallback(
    (miles: number) => {
      const radiusMiles = clamp(miles, DISTANCE_MIN_MILES, DISTANCE_MAX_MILES);
      setDraftDistance(radiusMiles);
      if (pendingSave.current) clearTimeout(pendingSave.current.timer);
      const save = () => {
        pendingSave.current = null;
        // If it can't be saved, the slider goes back to the saved distance.
        void updateSettings({ radiusMiles })
          .catch(() => ({ ok: false }) as const)
          .then((result) => setDraftDistance((draft) => (result.ok ? draft : null)));
      };
      pendingSave.current = { timer: setTimeout(save, DISTANCE_SAVE_DELAY_MS), save };
    },
    [updateSettings],
  );

  // Leaving the page straight after moving the slider still saves the distance.
  useEffect(
    () => () => {
      if (!pendingSave.current) return;
      clearTimeout(pendingSave.current.timer);
      pendingSave.current.save();
    },
    [],
  );

  const saveBasePostcode = useCallback(
    async (postcode: string): Promise<BasePostcodeResult> => {
      const result = await updateSettings({ postcode });
      return result.ok
        ? { ok: true, postcode: result.settings.postcode ?? postcode }
        : { ok: false, message: result.message };
    },
    [updateSettings],
  );

  const settings = settingsQuery.data;
  const distance = draftDistance ?? settings?.radiusMiles ?? INITIAL_DISTANCE_MILES;

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
    basePostcode: settings?.postcode ?? null,
    /** Where leads are measured from, for the area map; undefined until loaded. */
    base: settings?.base,
    basePostcodeLoaded: settingsQuery.isSuccess,
    saveBasePostcode,
  };
}

export type AlertSettingsState = ReturnType<typeof useAlertSettings>;
