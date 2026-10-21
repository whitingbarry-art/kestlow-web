import { useCallback, useState } from "react";
import {
  BASE_POSTCODE,
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

export function useAlertSettings() {
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
    basePostcode: BASE_POSTCODE,
    setDistance,
  };
}

export type AlertSettingsState = ReturnType<typeof useAlertSettings>;
