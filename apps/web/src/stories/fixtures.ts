import { SAMPLE_LEADS } from "../data/leads";
import type { Lead } from "../types/lead";

export const sampleLead: Lead = SAMPLE_LEADS[0];
export const multiTradeLead: Lead = SAMPLE_LEADS[1];
export const olderLead: Lead = SAMPLE_LEADS[2];

export const mobileViewport = { viewport: { value: "mobile", isRotated: false } };
export const desktopViewport = { viewport: { value: "desktop", isRotated: false } };
