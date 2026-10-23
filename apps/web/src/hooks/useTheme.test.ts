import { act, renderHook } from "@testing-library/react";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  it("writes the theme to the document and toggles it", () => {
    const { result } = renderHook(() => useTheme());
    expect(document.documentElement.dataset.theme).toBe("light");
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("starts dark when the device prefers a dark colour scheme", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
    }));
    try {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("dark");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
