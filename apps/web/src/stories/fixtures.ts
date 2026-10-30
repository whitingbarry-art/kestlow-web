import { SAMPLE_LEADS } from "../data/leads";
import type { Lead } from "../types/lead";

export const sampleLead: Lead = SAMPLE_LEADS[0];
export const multiTradeLead: Lead = SAMPLE_LEADS[1];
export const olderLead: Lead = SAMPLE_LEADS[2];

export const mobileViewport = { viewport: { value: "mobile", isRotated: false } };
export const desktopViewport = { viewport: { value: "desktop", isRotated: false } };

/** A lead placed only roughly, from the area its address names (KES-28). */
export const approximateLead: Lead = {
  ...SAMPLE_LEADS[3],
  address: "Garages fronting 1 to 27, Viola Avenue, Abbey Wood",
  miles: 4.3,
  approximate: true,
};

/** A lead as the free plan sees it (KES-52): the area, a rough place, no link, reference or applicant. */
export const maskedLead: Lead = {
  ...sampleLead,
  address: "Chislehurst, BR7",
  reference: null,
  sourceUrl: null,
  applicant: null,
  miles: 2,
  approximate: true,
  masked: true,
};
