import type { Decorator } from "@storybook/react-vite";
import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { StoryProviders } from "./StoryProviders";

/** Serves the story's leads from `api`, the sample leads by default, with a fresh cache. */
export function withLeadsApi(api: LeadsApi = createSampleLeadsApi()): Decorator {
  return (Story) => (
    <StoryProviders api={api}>
      <Story />
    </StoryProviders>
  );
}

/** An API that never answers, for loading states. */
export const pendingLeadsApi: LeadsApi = {
  listLeads: () => new Promise(() => {}),
  getLead: () => new Promise(() => {}),
  listSaved: () => new Promise(() => {}),
  saveLead: () => new Promise(() => {}),
  unsaveLead: () => new Promise(() => {}),
  getPushKey: () => new Promise(() => {}),
  subscribePush: () => new Promise(() => {}),
  unsubscribePush: () => new Promise(() => {}),
  getAlertSettings: () => new Promise(() => {}),
  updateAlertSettings: () => new Promise(() => {}),
  getSubscription: () => new Promise(() => {}),
  startTrial: () => new Promise(() => {}),
  checkout: () => new Promise(() => {}),
};

/** An API that always fails, for error states. */
export const failingLeadsApi: LeadsApi = {
  listLeads: () => Promise.reject(new Error("Network error")),
  getLead: () => Promise.reject(new Error("Network error")),
  listSaved: () => Promise.reject(new Error("Network error")),
  saveLead: () => Promise.reject(new Error("Network error")),
  unsaveLead: () => Promise.reject(new Error("Network error")),
  getPushKey: () => Promise.reject(new Error("Network error")),
  subscribePush: () => Promise.reject(new Error("Network error")),
  unsubscribePush: () => Promise.reject(new Error("Network error")),
  getAlertSettings: () => Promise.reject(new Error("Network error")),
  updateAlertSettings: () => Promise.reject(new Error("Network error")),
  getSubscription: () => Promise.reject(new Error("Network error")),
  startTrial: () => Promise.reject(new Error("Network error")),
  checkout: () => Promise.reject(new Error("Network error")),
};
