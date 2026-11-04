import { useEffect, useRef, useState } from "react";
import { createHttpLeadEmailsApi, type LeadEmailsApi } from "../../api/leadEmails";
import { signUpHref } from "../../logic/signUp";
import { buttonClassName } from "../ui/buttonStyles";
import { PublicLayout } from "./PublicLayout";

const defaultApi = createHttpLeadEmailsApi();
/** The trial link's ?ref=, the same as the weekly emails', so job:sources counts them together. */
const SOURCE = "leads-email";

type Status = "working" | "confirmed" | "first-sent" | "expired" | "stopped" | "failed";

interface LeadEmailsPageProps {
  /** Which link was opened: the confirm link or the stop link in the emails (KES-137). */
  action: "confirm" | "stop";
  token: string | null;
  api?: Pick<LeadEmailsApi, "confirm" | "stop">;
}

/**
 * Where the free weekly leads emails' links open (KES-137). The page does what the link says as
 * soon as it opens: links in emails can be opened by mail scanners, which don't run pages, so the
 * API is only called from here, never by opening the link alone.
 */
export function LeadEmailsPage({ action, token, api = defaultApi }: LeadEmailsPageProps) {
  // A link without its token can't work, whatever it was for.
  const [status, setStatus] = useState<Status>(token ? "working" : "expired");
  // Once, even when React runs the effect twice in development: confirming twice would report
  // the second time, when nothing more was sent.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    const done =
      action === "confirm"
        ? api
            .confirm(token)
            .then((result) =>
              setStatus(!result.ok ? "expired" : result.sent ? "first-sent" : "confirmed"),
            )
        : api.stop(token).then(() => setStatus("stopped"));
    done.catch(() => setStatus("failed"));
  }, [action, token, api]);

  const title = action === "confirm" ? "Your free weekly leads" : "Stop your weekly leads";
  const paragraph = (text: string) => <p className="mt-0 mb-4 text-lg">{text}</p>;

  return (
    <PublicLayout title={title}>
      <div role="status" aria-live="polite">
        {status === "working" &&
          paragraph(action === "confirm" ? "Confirming your email…" : "Stopping your emails…")}
        {status === "first-sent" &&
          paragraph(
            "You're confirmed. This week's leads are in your inbox now, and new ones come every Monday morning.",
          )}
        {status === "confirmed" &&
          paragraph(
            "You're all set. Your leads come by email every Monday morning, whenever there are new ones for your trade.",
          )}
        {status === "stopped" &&
          paragraph(
            "Done: you won't get any more emails from us, and we've deleted your email address and details.",
          )}
        {status === "expired" &&
          paragraph(
            "That link has stopped working: links to confirm last a week. You can ask for your leads again.",
          )}
        {status === "failed" &&
          paragraph("Something went wrong on our side. Please open the link again in a minute.")}
      </div>

      {(status === "first-sent" || status === "confirmed") && (
        <section aria-labelledby="leads-pro" className="rounded-card bg-card p-5 shadow-card">
          <h2 id="leads-pro" className="m-0 text-xl font-bold">
            Want them the morning they're in?
          </h2>
          <p className="mt-2 mb-4">
            The free emails come a week late, without the address. Pro sends every lead the morning
            it's in, with the full address and the council's page. Try it free for 14 days, with no
            card needed.
          </p>
          <a href={signUpHref(SOURCE)} className={buttonClassName("primary", "inline-block px-6")}>
            Start your free 14-day trial
          </a>
        </section>
      )}

      {(status === "expired" || status === "stopped") && (
        <a href="/#free-leads" className="text-lg font-semibold text-ink underline">
          {status === "expired" ? "Ask for your leads again" : "Changed your mind? Ask again"}
        </a>
      )}
    </PublicLayout>
  );
}
