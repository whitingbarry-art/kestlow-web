import type { Theme } from "../types/theme";

export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
