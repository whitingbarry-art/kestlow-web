import type { Trade } from "./lead";

export type DeliveryChannel = "email" | "push" | "weekend";

export interface DeliveryOption {
  key: DeliveryChannel;
  label: string;
  description: string;
}

export type DeliverySettings = Record<DeliveryChannel, boolean>;

export type TradeSettings = Record<Trade, boolean>;
