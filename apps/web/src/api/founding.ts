import { useEffect, useState } from "react";

/**
 * The first-20 offer from the API's `GET /public/founding`: Solo monthly at a lower price for as
 * long as they stay, while places are left. Counted by Stripe, so what the page says is true.
 */
export interface FoundingOffer {
  placesLeft: number;
  places: number;
  /** What a founding member pays each month, in pence. */
  monthlyPence: number;
  /** Solo monthly's usual price, in pence, from Stripe. */
  fullPence: number;
}

export type LoadFounding = () => Promise<FoundingOffer | null>;

/** The offer over HTTP; null when there's none or the API can't say, so no page ever guesses. */
export function createFoundingLoader(
  baseUrl = import.meta.env.VITE_API_URL || "/api",
): LoadFounding {
  return async () => {
    try {
      const res = await fetch(`${baseUrl}/public/founding`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      return ((await res.json()) as { offer: FoundingOffer | null }).offer;
    } catch {
      return null;
    }
  };
}

export const defaultLoadFounding = createFoundingLoader();

/** The offer once it's loaded, or null before then and when there's none. */
export function useFoundingOffer(load: LoadFounding = defaultLoadFounding): FoundingOffer | null {
  const [offer, setOffer] = useState<FoundingOffer | null>(null);
  useEffect(() => {
    let current = true;
    void load().then((found) => {
      if (current) setOffer(found);
    });
    return () => {
      current = false;
    };
  }, [load]);
  return offer;
}

/** "£19", or "£19.50" if it ever has pence. */
export function poundsOf(pence: number): string {
  return `£${pence % 100 === 0 ? pence / 100 : (pence / 100).toFixed(2)}`;
}
