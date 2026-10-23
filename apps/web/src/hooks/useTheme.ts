import { useCallback, useEffect, useState } from "react";
import { nextTheme } from "../logic/theme";
import type { Theme } from "../types/theme";

function preferredTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme(initialTheme?: Theme) {
  const [theme, setTheme] = useState<Theme>(() => initialTheme ?? preferredTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(nextTheme), []);

  return { theme, toggleTheme };
}
