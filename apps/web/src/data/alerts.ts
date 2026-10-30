import type { DeliveryOption, DeliverySettings } from "../types/alerts";

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { key: "email", label: "Email alerts", description: "Daily digest at 7:30am" },
  { key: "push", label: "Push notifications", description: "Each evening, as new leads come in" },
  { key: "weekend", label: "Weekend alerts", description: "Off keeps Saturday and Sunday quiet" },
];

/** What the API gives someone who hasn't chosen yet: a daily email, nothing on weekends, no push. */
export const DEFAULT_DELIVERY: DeliverySettings = { email: true, push: false, weekend: false };

export const DISTANCE_MIN_MILES = 1;
export const DISTANCE_MAX_MILES = 50;
export const INITIAL_DISTANCE_MILES = 15;
