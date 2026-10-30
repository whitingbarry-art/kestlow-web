import { renderHook, waitFor } from "@testing-library/react";
import { createSampleAuthApi, SAMPLE_USER } from "../api/sampleAuthApi";
import { createSampleLeadsApi, FREE_PLAN } from "../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../data/leads";
import { providers } from "../test/providers";
import { useStartTrial } from "./useStartTrial";

describe("useStartTrial", () => {
  it("starts the free trial once the email is confirmed, and only asks once", async () => {
    const api = createSampleLeadsApi();
    const startTrial = vi.spyOn(api, "startTrial");
    const { rerender } = renderHook(() => useStartTrial(), { wrapper: providers(api) });

    await waitFor(() => expect(startTrial).toHaveBeenCalledOnce());
    rerender();
    expect(await api.getSubscription()).toMatchObject({ plan: "pro", status: "trialing" });
    expect(startTrial).toHaveBeenCalledOnce();
  });

  it("waits while the email isn't confirmed", async () => {
    const api = createSampleLeadsApi();
    const startTrial = vi.spyOn(api, "startTrial");
    const getSubscription = vi.spyOn(api, "getSubscription");
    const authApi = createSampleAuthApi({ ...SAMPLE_USER, emailVerified: false });
    renderHook(() => useStartTrial(), { wrapper: providers(api, authApi) });

    await waitFor(() => expect(getSubscription).toHaveBeenCalled());
    expect(startTrial).not.toHaveBeenCalled();
  });

  it("leaves someone who's had their trial alone", async () => {
    const api = createSampleLeadsApi(SAMPLE_LEADS, 20, [], null, {
      ...FREE_PLAN,
      trialAvailable: false,
    });
    const startTrial = vi.spyOn(api, "startTrial");
    const getSubscription = vi.spyOn(api, "getSubscription");
    renderHook(() => useStartTrial(), { wrapper: providers(api) });

    await waitFor(() => expect(getSubscription).toHaveBeenCalled());
    expect(startTrial).not.toHaveBeenCalled();
  });
});
