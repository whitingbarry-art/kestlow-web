import { useCallback, useEffect, useState } from "react";
import { nextTheme } from "../logic/theme";
import type { Theme } from "../types/theme";

export function useTheme(initialTheme: Theme = "light") {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(nextTheme), []);

  return { theme, toggleTheme };
}
