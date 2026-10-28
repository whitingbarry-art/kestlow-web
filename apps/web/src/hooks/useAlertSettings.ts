import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AlertSettings,
  AlertSettingsChanges,
  AlertSettingsResult,
  BasePostcodeResult,
  LeadsApi,
} from "../api/leads";
import { useLeadsApi } from "../api/LeadsApiContext";
import {
  DEFAULT_DELIVERY,
  DELIVERY_OPTIONS,
  DISTANCE_MAX_MILES,
  DISTANCE_MIN_MILES,
  INITIAL_DISTANCE_MILES,
} from "../data/alerts";
import { TRADES } from "../data/leads";
import { clamp, formatDistance } from "../logic/alerts";
import type { DeliveryChannel, TradeSettings } from "../types/alerts";
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

/** The fields of `from` that `changes` touches, to put them back as they were. */
function pick(from: AlertSettings, changes: Pick<AlertSettingsChanges, "trades" | "delivery">) {
  return {
    ...("trades" in changes && { trades: from.trades }),
    ...("delivery" in changes && { delivery: from.delivery }),
  };
}

/** The slider saves this long after it stops moving, so dragging doesn't send every mile. */
export const DISTANCE_SAVE_DELAY_MS = 500;

export function useAlertSettings() {
  const api = useLeadsApi();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery(alertSettingsQuery(api));
  const { mutateAsync: updateSettings } = useMutation({
    mutationFn: (changes: AlertSettingsChanges) => api.updateAlertSettings(changes),
    onSuccess: (result, changes) => {
      if (!result.ok) return;
      queryClient.setQueryData(ALERT_SETTINGS_KEY, result.settings);
      // A new base or distance measures leads differently, so fetch them again (in the background).
      if ("postcode" in changes || "radiusMiles" in changes)
        void queryClient.invalidateQueries({
          predicate: (query) => MEASURED_FROM_BASE.has(String(query.queryKey[0])),
        });
    },
  });

  /** Shows a toggle's change straight away, and puts it back if it can't be saved. */
  const changeNow = useCallback(
    (changes: Pick<AlertSettingsChanges, "trades" | "delivery">) => {
      const before = queryClient.getQueryData<AlertSettings>(ALERT_SETTINGS_KEY);
      if (!before) return;
      queryClient.setQueryData<AlertSettings>(ALERT_SETTINGS_KEY, { ...before, ...changes });
      const putBack = () =>
        queryClient.setQueryData<AlertSettings>(ALERT_SETTINGS_KEY, (now) =>
          now ? { ...now, ...pick(before, changes) } : before,
        );
      void updateSettings(changes)
        .then((result) => !result.ok && putBack())
        .catch(putBack);
    },
    [queryClient, updateSettings],
  );
  // The distance while the slider moves, until it's saved; null shows the saved one.
  const [draftDistance, setDraftDistance] = useState<number | null>(null);
  const pendingSave = useRef<{ timer: ReturnType<typeof setTimeout>; save: () => void } | null>(
    null,
  );

  const settings = settingsQuery.data;
  const delivery = settings?.delivery ?? DEFAULT_DELIVERY;
  const chosenTrades = settings?.trades ?? TRADES;

  const toggleDelivery = useCallback(
    (key: DeliveryChannel) => changeNow({ delivery: { ...delivery, [key]: !delivery[key] } }),
    [changeNow, delivery],
  );

  const toggleTrade = useCallback(
    (trade: Trade) =>
      changeNow({
        // Kept in the usual order, as the API keeps them.
        trades: TRADES.filter((t) => (t === trade) !== chosenTrades.includes(t)),
      }),
    [changeNow, chosenTrades],
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

  /** Saves several settings at once, as onboarding does; a lost connection becomes a message. */
  const saveChanges = useCallback(
    (changes: AlertSettingsChanges): Promise<AlertSettingsResult> =>
      updateSettings(changes).catch(() => ({
        ok: false,
        message: "We couldn't reach Kestlow. Please try again in a minute.",
      })),
    [updateSettings],
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

  const distance = draftDistance ?? settings?.radiusMiles ?? INITIAL_DISTANCE_MILES;
  const trades = Object.fromEntries(
    TRADES.map((t) => [t, chosenTrades.includes(t)]),
  ) as TradeSettings;
  const { refetch } = settingsQuery;

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
    saveChanges,
    settingsStatus: {
      isPending: settingsQuery.isPending,
      isError: settingsQuery.isError,
      retry: () => void refetch(),
    },
  };
}

export type AlertSettingsState = ReturnType<typeof useAlertSettings>;
