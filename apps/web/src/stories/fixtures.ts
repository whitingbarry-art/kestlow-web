import { LEADS } from "../data/leads";
import type { Lead } from "../types/lead";

export const sampleLead: Lead = LEADS[0];
export const multiTradeLead: Lead = LEADS[1];
export const olderLead: Lead = LEADS[2];

export const mobileViewport = { viewport: { value: "mobile", isRotated: false } };
export const desktopViewport = { viewport: { value: "desktop", isRotated: false } };
