import { useState } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import { useSession } from "../../hooks/useSession";

/**
 * Reminds someone who hasn't confirmed their email to do it (KES-40), as alerts wait for it, with
 * a way to send the link again. Hidden once they have.
 */
export function VerifyEmailBanner() {
  const api = useAuthApi();
  const user = useSession().data;
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  if (!user || user.emailVerified) return null;

  async function resend() {
    if (!user) return;
    setSending(true);
    const result = await api
      .resendVerification(user.email)
      .catch(
        () => ({ ok: false, message: "We couldn't reach Kestlow. Please try again." }) as const,
      );
    setSending(false);
    setStatus(result.ok ? "Sent. Check your inbox, and your spam folder too." : result.message);
  }

  return (
    <div className="mx-4 mt-3 rounded-card border-2 border-amber bg-card p-3.5 text-[15px] desk:mx-6">
      <p className="m-0">
        <b>Please confirm your email.</b> We sent a link to {user.email}. Alerts start once you've
        used it.
      </p>
      <p role="status" className="m-0 min-h-[1lh] text-sm font-semibold">
        {status}
      </p>
      <button
        type="button"
        onClick={() => void resend()}
        disabled={sending}
        className="min-h-11 font-semibold text-ink underline"
      >
        {sending ? "Sending…" : "Send the link again"}
      </button>
    </div>
  );
}
