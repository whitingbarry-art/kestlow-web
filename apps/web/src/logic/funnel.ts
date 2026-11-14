/**
 * The steps to an account that Kestlow counts (KES-130), from the jobs page (KES-155) or the
 * launch page.
 */
export type FunnelStep =
  | "jobs_viewed"
  | "jobs_searched"
  | "job_tapped"
  | "launch_viewed"
  | "trial_tapped"
  | "register_viewed"
  | "register_tried"
  | "register_refused";

export interface StepDetails {
  /** The page's ?ref=, such as a counter card's shop code or an ad's. */
  source?: string;
  /** Why a sign-up was refused, as a short code such as password-too-weak. */
  reason?: string;
}

export type RecordStep = (step: FunnelStep, details?: StepDetails) => void;

/**
 * Counts a step at `${baseUrl}/events`: which step, the card or ad's code and a refusal's reason,
 * nothing about who. keepalive, so the step that leaves the page (tapping the trial) still goes;
 * failures are ignored, as counting must never get in anyone's way.
 */
export function createStepRecorder({
  baseUrl = import.meta.env.VITE_API_URL || "/api",
  fetchFn = (...args: Parameters<typeof fetch>) => fetch(...args),
}: { baseUrl?: string; fetchFn?: typeof fetch } = {}): RecordStep {
  return (step, { source, reason } = {}) => {
    void Promise.resolve()
      .then(() =>
        fetchFn(`${baseUrl}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step, source, reason }),
          keepalive: true,
        }),
      )
      .catch(() => {});
  };
}

/** The app's own recorder. */
export const recordStep: RecordStep = createStepRecorder();

/** A Better Auth error code as a funnel reason: USER_ALREADY_EXISTS becomes user-already-exists. */
export const reasonFromCode = (code: string | undefined) =>
  code ? code.toLowerCase().replace(/_/g, "-") : "no-reply";
