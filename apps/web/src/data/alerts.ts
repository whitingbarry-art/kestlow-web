import type { DeliveryOption, DeliverySettings, TradeSettings } from "../types/alerts";

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { key: "email", label: "Email alerts", description: "Daily digest at 7:30am" },
  { key: "push", label: "Push notifications", description: "Instant, as leads appear" },
  { key: "weekend", label: "Weekend alerts", description: "Off keeps Saturday and Sunday quiet" },
];

export const INITIAL_DELIVERY: DeliverySettings = { email: true, push: true, weekend: false };

export const INITIAL_TRADES: TradeSettings = {
  Roofing: true,
  Electrical: true,
  Landscaping: false,
  Groundworks: true,
};

export const DISTANCE_MIN_MILES = 1;
export const DISTANCE_MAX_MILES = 50;
export const INITIAL_DISTANCE_MILES = 15;
export const BASE_POSTCODE = "AB1 2CD (sample)";
