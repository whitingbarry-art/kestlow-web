import type { JoinWaitlist } from "../../api/waitlist";
import { DATA_CONTROLLER, PLANS, PROMISES } from "../../data/waitlist";
import { BrandLogo } from "../ui/BrandLogo";
import { buttonClassName } from "../ui/buttonStyles";
import { PlanCard } from "./PlanCard";
import { WaitlistForm } from "./WaitlistForm";

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

interface WaitlistPageProps {
  join: JoinWaitlist;
}

/** The public landing page: what Kestlow does, the plans, and the waitlist sign-up (KES-97). */
export function WaitlistPage({ join }: WaitlistPageProps) {
  return (
    <div className="min-h-screen">
      <a
        href="#join"
        className="sr-only z-30 rounded-xl bg-card font-bold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-3"
      >
        Skip to the sign-up form
      </a>

      <header className="brand-surface pt-5 pb-12 text-white [--focus:#ffffff]">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo />
            {/* The app shows the sign-in screen to anyone who isn't signed in. */}
            <a href="/" className="inline-block py-2 font-semibold text-white underline">
              Sign in
            </a>
          </div>
          <h1 className="mt-10 mb-0 max-w-2xl text-3xl leading-tight font-bold desk:text-5xl">
            Hear about building work while it’s still being planned
          </h1>
          <p className="mt-4 mb-0 max-w-2xl text-lg text-side-link">
            Kestlow alerts roofers, electricians, landscapers and groundworkers to new planning
            applications near them. Starting with Bromley and the councils around it.
          </p>
          <a
            href="#join"
            className={buttonClassName("primary", "mt-7 inline-block flex-none px-6")}
          >
            Join the waitlist
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <section aria-labelledby="how" className="py-12">
          <h2 id="how" className="m-0 text-2xl font-bold">
            How it works
          </h2>
          <ol className="mt-5 mb-0 grid gap-4 pl-0 desk:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="list-none rounded-card bg-card p-5 shadow-card">
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full bg-amber font-bold text-navy"
                >
                  {index + 1}
                </span>
                <h3 className="mt-3 mb-0 text-lg font-bold">{step.title}</h3>
                <p className="mt-1 mb-0 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="plans" className="py-12">
          <h2 id="plans" className="m-0 text-2xl font-bold">
            Plans and prices
          </h2>
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
          <ul className="mt-6 mb-0 grid gap-2 pl-0 sm:grid-cols-2">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex list-none gap-2">
                <span aria-hidden="true" className="font-bold text-match-text">
                  ✓
                </span>
                {promise}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="join-title" id="join" tabIndex={-1} className="py-12">
          <h2 id="join-title" className="m-0 text-2xl font-bold">
            Join the waitlist
          </h2>
          <p className="mt-2 mb-6 max-w-2xl text-muted">
            We'll email you when Kestlow opens in your area. Five quick questions help us set fair
            prices and choose where to start.
          </p>
          <div className="max-w-2xl">
            <WaitlistForm join={join} />
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-5xl px-4 text-sm text-muted">
          <h2 className="m-0 text-base font-bold text-ink">Your details</h2>
          <p className="mt-2 mb-0 max-w-2xl">
            We use your email address only to tell you when Kestlow opens and about the founding
            member offer. We keep your answers to set prices and decide where to launch, and we only
            keep the first half of your postcode. We never sell or share your details. Kestlow is
            run by {DATA_CONTROLLER.name}. To see or delete your details, email{" "}
            <a
              href={`mailto:${DATA_CONTROLLER.email}`}
              className="font-semibold text-ink underline"
            >
              {DATA_CONTROLLER.email}
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
