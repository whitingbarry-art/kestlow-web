import { Check } from "lucide-react";
import { PLANS, PROMISES } from "../../data/waitlist";
import { signUpHref } from "../../logic/signUp";
import { BrandLogo } from "../ui/BrandLogo";
import { buttonClassName } from "../ui/buttonStyles";
import { PlanCard } from "../waitlist/PlanCard";
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

interface LaunchPageProps {
  /** The ?ref= the page was opened with, such as a counter card's shop code or an ad (KES-125). */
  source?: string;
}

/**
 * The public landing page at /waitlist/, where the counter cards' QR codes and the ads point
 * (KES-125): what Kestlow does, the plans, and a way into the free trial. Its buttons carry the
 * ?ref= on to creating an account, so we can tell which card or ad brought someone in.
 */
export function LaunchPage({ source }: LaunchPageProps) {
  const start = signUpHref(source);
  return (
    <div className="min-h-screen">
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
            applications near them. Covering Bromley and the councils around it.
          </p>
          <a
            href={start}
            className={buttonClassName("primary", "mt-7 inline-block flex-none px-6")}
          >
            Start your free 14-day trial
          </a>
          <p className="mt-3 mb-0 text-side-link">
            Pro free for 14 days, no card needed. Then choose a plan, or carry on free.
          </p>
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
          <ul className="mt-6 mb-0 grid gap-2 pl-0 sm:grid-cols-2">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex list-none gap-2">
                <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-match-text" />
                {promise}
              </li>
            ))}
          </ul>
          <a href={start} className={buttonClassName("primary", "mt-8 inline-block px-6")}>
            Start your free 14-day trial
          </a>
        </section>
      </main>

      <SiteFooter className="border-t border-line" />
    </div>
  );
}
