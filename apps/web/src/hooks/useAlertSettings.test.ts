import { act, renderHook } from "@testing-library/react";
import { useAlertSettings } from "./useAlertSettings";

describe("useAlertSettings", () => {
  it("toggles delivery and trade settings", () => {
    const { result } = renderHook(() => useAlertSettings());
    act(() => result.current.toggleDelivery("weekend"));
    act(() => result.current.toggleTrade("Roofing"));
    expect(result.current.delivery.weekend).toBe(true);
    expect(result.current.trades.Roofing).toBe(false);
  });

  it("clamps the distance and formats its label", () => {
    const { result } = renderHook(() => useAlertSettings());
    act(() => result.current.setDistance(80));
    expect(result.current.distance).toBe(50);
    expect(result.current.distanceLabel).toBe("50 miles");
  });
});
