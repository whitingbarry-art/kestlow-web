import { Check } from "lucide-react";
import { useEffect } from "react";
import { createPreviewLoader, type LoadPreview } from "../../api/preview";
import { PLANS, PROMISES } from "../../data/waitlist";
import { recordStep as defaultRecordStep, type RecordStep } from "../../logic/funnel";
import { signUpHref } from "../../logic/signUp";
import { BrandLogo } from "../ui/BrandLogo";
import { buttonClassName } from "../ui/buttonStyles";
import { PlanCard } from "../waitlist/PlanCard";
import { LivePreview } from "./launch/LivePreview";
import { PhoneMockup } from "./launch/PhoneMockup";
import { Faq, Features, LeadAnatomy, PlanComparison } from "./launch/Sections";
import { SiteFooter } from "./SiteFooter";

const STEPS = [
  {
    title: "Tell us your trades and area",
    text: "Roofing, electrical, landscaping or groundworks, as far from your base as you'll travel.",
  },
  {
    title: "We read the new planning applications",
    text: "Every night we check the councils' new applications and pick out the ones that need your trade.",
  },
  {
    title: "You hear about the job early",
    text: "A push alert or a morning email with the address, what's planned and a link to the council's page, so you can get in touch early.",
  },
];

const defaultLoadPreview = createPreviewLoader();

interface LaunchPageProps {
  /** The ?ref= the page was opened with, such as a counter card's shop code or an ad (KES-125). */
  source?: string;
  /** Counts the visit and the trial taps (KES-130); tests pass a spy. */
  recordStep?: RecordStep;
  /** Loads the live local numbers and leads (KES-131); tests and stories pass their own. */
  loadPreview?: LoadPreview;
}

/**
 * The public landing page at /waitlist/, where the counter cards' QR codes and the ads point
 * (KES-125, KES-131): what Kestlow does, real local leads, why it's worth it, what a lead holds,
 * the plans, straight answers, and a way into the free trial throughout. Its buttons carry the
 * ?ref= on to creating an account, so we can tell which card or ad brought someone in.
 */
export function LaunchPage({
  source,
  recordStep = defaultRecordStep,
  loadPreview = defaultLoadPreview,
}: LaunchPageProps) {
  const start = signUpHref(source);
  // Which card or ad brought people here, and how many go on to the trial (KES-130).
  useEffect(() => recordStep("launch_viewed", { source }), [recordStep, source]);
  const tapped = () => recordStep("trial_tapped", { source });
  const trialButton = (className: string) => (
    <a href={start} onClick={tapped} className={buttonClassName("primary", className)}>
      Start your free 14-day trial
    </a>
  );

  return (
    <div className="min-h-screen">
      {/* A fixed height on wider screens, so the photo never zooms as the window changes size;
          the text scales with the width to fit it. */}
      <header className="brand-surface relative overflow-hidden pt-5 pb-12 text-white [--focus:#ffffff] desk:flex desk:h-[620px] desk:flex-col desk:pb-10">
        {/* The roofers behind the headline, darkened so the words stay readable: from the top on
            phones, and from the left on wider screens, where the phone sits on the right. The
            photo is always the header's height and its own shape, anchored right, its left edge
            fading out so very wide screens show no seam where the dark blue takes over. */}
        <img
          src="/launch/roofers-1200.webp"
          srcSet="/launch/roofers-640.webp 640w, /launch/roofers-1200.webp 1200w"
          sizes="(min-width: 900px) 930px, 100vw"
          alt=""
          className="absolute top-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 desk:right-0 desk:left-auto desk:translate-x-0 desk:[mask-image:linear-gradient(to_right,transparent,black_45%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/90 to-navy desk:bg-gradient-to-r desk:from-navy desk:via-navy/85 desk:to-navy/30" />
        <div className="relative mx-auto w-full max-w-6xl px-4 desk:flex desk:flex-1 desk:flex-col">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo />
            {/* The app shows the sign-in screen to anyone who isn't signed in. */}
            <a href="/" className="inline-block py-2 font-semibold text-white underline">
              Sign in
            </a>
          </div>
          {/* The text takes whatever room is left; the phone keeps its size and stays on screen. */}
          <div className="mt-8 grid items-center gap-10 desk:mt-0 desk:flex-1 desk:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-2xl">
              <h1 className="m-0 text-3xl leading-tight font-bold desk:text-[clamp(2.25rem,3.6vw,3rem)]">
                Hear about building work while it’s still being planned
              </h1>
              <p className="mt-4 mb-0 text-lg text-side-link desk:text-[clamp(1rem,1.5vw,1.125rem)]">
                Kestlow picks out the new planning applications near you that need a roofer,
                electrician, landscaper or groundworker, and sends them to your phone every morning.
              </p>
              <ul className="mt-5 mb-0 flex flex-col gap-2 pl-0">
                {[
                  "New applications from 8 councils around Bromley",
                  "Picked out for your trade, with the distance",
                  "Pro free for 14 days, no card needed",
                ].map((point) => (
                  <li key={point} className="flex list-none gap-2">
                    <Check size={20} strokeWidth={2.5} className="mt-0.5 shrink-0 text-amber" />
                    {point}
                  </li>
                ))}
              </ul>
              {trialButton("mt-7 inline-block flex-none px-6")}
              <p className="mt-3 mb-0 text-sm text-side-link">
                Then choose a plan, or carry on free. No contract.
              </p>
            </div>
            {/* On wider screens, the app on a phone, over the photo. */}
            <div className="hidden desk:block">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <LivePreview load={loadPreview} start={start} onStart={tapped} />
        <Features />

        <section aria-labelledby="how" className="py-8 desk:py-12">
          <h2 id="how" className="m-0 text-2xl font-bold">
            How it works
          </h2>
          <ol className="mt-5 mb-0 grid gap-2 pl-0 desk:grid-cols-3 desk:gap-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex list-none gap-3 rounded-card bg-card p-4 shadow-card desk:block desk:p-5"
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-amber font-bold text-navy"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="m-0 text-base font-bold desk:mt-3 desk:text-lg">{step.title}</h3>
                  <p className="mt-0.5 mb-0 text-sm text-muted desk:mt-1 desk:text-base">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <LeadAnatomy />

        <section aria-labelledby="plans" className="py-8 desk:py-12">
          <h2 id="plans" className="m-0 text-2xl font-bold">
            Plans and prices
          </h2>
          <p className="mt-2 mb-0 text-muted">
            Every account starts with 14 days of Pro free. No VAT is added: we're not registered for
            VAT.
          </p>
          <div className="mt-4 rounded-card border-2 border-amber bg-card p-4">
            <p className="m-0">
              <b>Founding members:</b> the first 100 paying customers keep their launch price for as
              long as they stay subscribed.
            </p>
          </div>
          <div className="mt-5 grid gap-4 desk:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
          <PlanComparison />
          <ul className="mt-6 mb-0 grid gap-2 pl-0 sm:grid-cols-2">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex list-none gap-2">
                <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-match-text" />
                {promise}
              </li>
            ))}
          </ul>
        </section>

        <Faq />

        <section
          aria-labelledby="start"
          className="brand-surface my-12 rounded-card px-6 py-10 text-center text-white [--focus:#ffffff]"
        >
          <h2 id="start" className="m-0 text-2xl font-bold desk:text-3xl">
            See the work near you this morning
          </h2>
          <p className="mx-auto mt-3 mb-0 max-w-xl text-side-link">
            14 days of Pro, free, with no card. If it's not for you, just stop.
          </p>
          {trialButton("mt-6 inline-block px-6")}
        </section>
      </main>

      <SiteFooter className="border-t border-line" />
      <p className="m-0 pb-6 text-center text-xs text-muted">Photo by Raze Solar on Unsplash.</p>
    </div>
  );
}
