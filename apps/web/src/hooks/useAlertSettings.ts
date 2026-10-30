import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AlertSettings,
  AlertSettingsChanges,
  AlertSettingsResult,
  BasePostcodeResult,
  LeadsApi,
  PlanLimits,
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
import {
  browserPush,
  disablePush,
  enablePush,
  isPushOnHere,
  PushUnavailable,
  type PushBrowser,
} from "../logic/push";
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

/** Pro's limits, which apply until the API says which plan someone's on (KES-52). */
const FULL_LIMITS: PlanLimits = {
  maxRadiusMiles: DISTANCE_MAX_MILES,
  maxTrades: TRADES.length,
  push: true,
};

/** The slider saves this long after it stops moving, so dragging doesn't send every mile. */
export const DISTANCE_SAVE_DELAY_MS = 500;

export function useAlertSettings({
  pushBrowser = browserPush,
}: { pushBrowser?: PushBrowser } = {}) {
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
  // What their plan allows (KES-52); everything until the API says otherwise.
  const limits = settings?.limits ?? FULL_LIMITS;

  // Why push couldn't be turned on in this browser, shown under the delivery choices.
  const [pushProblem, setPushProblem] = useState<{ message: string; help: boolean } | null>(null);
  // Whether this browser gets the account's push alerts; null until known (KES-118).
  const [pushHere, setPushHere] = useState<boolean | null>(null);
  const pushOnForAccount = delivery.push;

  useEffect(() => {
    if (!pushOnForAccount) return;
    let current = true;
    void isPushOnHere(pushBrowser).then((here) => current && setPushHere(here));
    return () => {
      current = false;
    };
  }, [pushOnForAccount, pushBrowser]);

  const pushFailed = useCallback(
    (error: unknown) =>
      setPushProblem(
        error instanceof PushUnavailable
          ? { message: error.message, help: error.help }
          : { message: "We couldn't reach Kestlow. Please try again in a minute.", help: false },
      ),
    [],
  );

  /** Adds this browser when push is already on for the account, from another device. */
  const turnOnPushHere = useCallback(() => {
    setPushProblem(null);
    void enablePush(api, pushBrowser)
      .then(() => setPushHere(true))
      .catch(pushFailed);
  }, [api, pushBrowser, pushFailed]);

  const toggleDelivery = useCallback(
    (key: DeliveryChannel) => {
      const turnOn = !delivery[key];
      if (key !== "push") return changeNow({ delivery: { ...delivery, [key]: turnOn } });
      if (turnOn && !limits.push)
        return setPushProblem({ message: "Push alerts come with Solo and Pro.", help: true });
      // Push needs this browser's permission and subscription first (KES-32); turning it off
      // forgets the browser, and goes ahead even if that fails, so alerts stop either way.
      setPushProblem(null);
      void (turnOn ? enablePush(api, pushBrowser) : disablePush(api, pushBrowser).catch(() => {}))
        .then(() => {
          setPushHere(turnOn);
          changeNow({ delivery: { ...delivery, push: turnOn } });
        })
        .catch(pushFailed);
    },
    [api, changeNow, delivery, limits.push, pushBrowser, pushFailed],
  );

  const toggleTrade = useCallback(
    (trade: Trade) => {
      // Kept in the usual order, as the API keeps them.
      const toggled = TRADES.filter((t) => (t === trade) !== chosenTrades.includes(t));
      // On a one-trade plan, choosing a trade swaps it for the one they had (KES-52).
      const trades =
        toggled.length > limits.maxTrades && chosenTrades.includes(trade) === false
          ? [trade]
          : toggled;
      changeNow({ trades });
    },
    [changeNow, chosenTrades, limits.maxTrades],
  );

  const setDistance = useCallback(
    (miles: number) => {
      const radiusMiles = clamp(miles, DISTANCE_MIN_MILES, limits.maxRadiusMiles);
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
    [updateSettings, limits.maxRadiusMiles],
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
    // The free plan's email comes on Monday mornings (KES-52).
    deliveryOptions:
      limits.digest === "weekly"
        ? DELIVERY_OPTIONS.map((option) =>
            option.key === "email"
              ? { ...option, description: "Weekly digest, Monday at 7:30am" }
              : option,
          )
        : DELIVERY_OPTIONS,
    pushProblem: pushProblem?.message ?? null,
    /** The push message is steps to follow, not a problem, so it's shown calmly (KES-120). */
    pushProblemIsHelp: pushProblem?.help ?? false,
    /** Push is on for the account, but this device doesn't get the alerts (KES-118). */
    pushOffHere: delivery.push && pushHere === false,
    turnOnPushHere,
    delivery,
    toggleDelivery,
    tradeOptions: TRADES,
    trades,
    toggleTrade,
    distance,
    distanceLabel: formatDistance(distance),
    distanceMin: DISTANCE_MIN_MILES,
    distanceMax: limits.maxRadiusMiles,
    /** The plan they're on and what it allows (KES-52), for the notes beside each limit. */
    plan: settings?.plan ?? "pro",
    limits,
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
