import { useCallback, useState } from "react";
import type { View } from "../types/navigation";

interface UseNavigationOptions {
  initialView?: View;
  onNavigate?: (view: View) => void;
}

export function useNavigation({ initialView = "leads", onNavigate }: UseNavigationOptions = {}) {
  const [view, setView] = useState<View>(initialView);

  const navigate = useCallback(
    (next: View) => {
      setView(next);
      onNavigate?.(next);
    },
    [onNavigate],
  );

  return { view, navigate };
}
