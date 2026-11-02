import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLeadsApi } from "../../api/LeadsApiContext";
import { CONTACT } from "../../data/contact";
import { Button } from "../ui/Button";

interface ManagePlanButtonProps {
  /** Leaves for Stripe's Customer Portal; tests pass a spy. */
  goTo?: (url: string) => void;
  className?: string;
}

/**
 * Opens Stripe's Customer Portal (KES-51), where a customer changes or cancels their plan,
 * updates their card and downloads invoices, then comes back to Kestlow. If it can't open, they
 * can still email billing.
 */
export function ManagePlanButton({
  goTo = (url) => window.location.assign(url),
  className,
}: ManagePlanButtonProps) {
  const api = useLeadsApi();
  const [message, setMessage] = useState<string | null>(null);
  const portal = useMutation({
    mutationFn: () => api.openPortal(),
    onSuccess: (result) => (result.ok ? goTo(result.url) : setMessage(result.message)),
    onError: () =>
      setMessage(
        `We couldn't open your billing page. Please try again, or email ${CONTACT.billing}.`,
      ),
  });

  return (
    <div className={className}>
      <Button className="w-full" disabled={portal.isPending} onClick={() => portal.mutate()}>
        {portal.isPending ? "Opening your billing page…" : "Manage my plan"}
      </Button>
      <p className="mt-2 mb-0 text-sm text-muted">
        Change or cancel your plan, update your card, or download invoices.
      </p>
      <p role="status" className="mt-1 mb-0 min-h-[1lh] text-sm font-semibold text-error">
        {message}
      </p>
    </div>
  );
}
