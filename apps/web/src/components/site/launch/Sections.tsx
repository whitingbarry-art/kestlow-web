import {
  Bell,
  Bookmark,
  Check,
  HardHat,
  Landmark,
  MapPin,
  Minus,
  Search,
  Smartphone,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import { FAQS, FEATURES, PLAN_ROWS, type FeatureIcon } from "../../../data/launch";
import { SAMPLE_LEADS } from "../../../data/leads";

const ICONS: Record<FeatureIcon, LucideIcon> = {
  sunrise: Sunrise,
  trade: HardHat,
  map: MapPin,
  councils: Landmark,
  bell: Bell,
  search: Search,
  save: Bookmark,
  phone: Smartphone,
};

/** Why Kestlow (KES-131): what it does, each true today. */
export function Features() {
  return (
    <section aria-labelledby="why" className="py-8 desk:py-12">
      <h2 id="why" className="m-0 text-2xl font-bold">
        Why tradespeople use Kestlow
      </h2>
      {/* A compact list on phones, so all eight fit on about a screen; cards on wider screens. */}
      <ul className="mt-5 mb-0 grid gap-2 pl-0 sm:grid-cols-2 desk:mt-6 desk:grid-cols-4 desk:gap-4">
        {FEATURES.map(({ icon, title, text }) => {
          const Icon = ICONS[icon];
          return (
            <li
              key={title}
              className="flex list-none gap-3 rounded-card bg-card p-4 shadow-card desk:block desk:p-5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber text-navy desk:size-11">
                <Icon size={20} strokeWidth={2.25} aria-hidden="true" />
              </span>
              <div>
                <h3 className="m-0 text-base font-bold desk:mt-3 desk:text-lg">{title}</h3>
                <p className="mt-0.5 mb-0 text-sm text-muted desk:mt-1 desk:text-base">{text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** One lead with every detail named (KES-131), using a made-up sample, labelled as one. */
export function LeadAnatomy() {
  const lead = SAMPLE_LEADS[0];
  const parts: [string, string][] = [
    ["What's planned", lead.description],
    ["Where", `${lead.address}, ${lead.council}, ${lead.miles} miles from your base`],
    ["Trades it needs", lead.trades.join(", ")],
    ["Type", lead.applicationType],
    ["Who applied", lead.applicant ?? "Not given"],
    ["Council reference", lead.reference ?? ""],
    ["Plus", "a link to the council's page, with the plans and drawings"],
  ];
  return (
    <section aria-labelledby="what" className="py-8 desk:py-12">
      <h2 id="what" className="m-0 text-2xl font-bold">
        What you get in each lead
      </h2>
      <p className="mt-2 mb-0 text-muted">An example, with Solo or Pro:</p>
      <dl className="mt-5 mb-0 grid max-w-3xl gap-0 rounded-card bg-card p-2 shadow-card">
        {parts.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 border-b border-line px-3 py-3 last:border-b-0 sm:grid-cols-[12rem_1fr]"
          >
            <dt className="font-bold">{label}</dt>
            <dd className="m-0 text-muted">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const cell = (value: string | boolean, label: string) =>
  typeof value === "string" ? (
    value
  ) : value ? (
    <Check size={20} strokeWidth={2.5} className="text-match-text" aria-label={`${label}: yes`} />
  ) : (
    <Minus size={20} className="text-muted" aria-label={`${label}: no`} />
  );

/** Free, Solo and Pro side by side (KES-131). */
export function PlanComparison() {
  return (
    // Scrolls sideways on a phone, so keyboards must be able to reach it (axe's
    // scrollable-region-focusable): a labelled region is the accepted exception to the lint rule.
    <div
      role="region"
      aria-label="Plans compared"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      // On phones the plan cards above say the same without scrolling sideways, so it's left out.
      className="mt-8 overflow-x-auto rounded-card bg-card shadow-card max-desk:hidden"
    >
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <caption className="sr-only">Free, Solo and Pro compared</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="p-3">
              <span className="sr-only">What you get</span>
            </th>
            {["Free", "Solo", "Pro"].map((name) => (
              <th key={name} scope="col" className="p-3 text-lg">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_ROWS.map(({ label, free, solo, pro }) => (
            <tr key={label} className="border-b border-line last:border-b-0">
              <th scope="row" className="p-3 font-semibold">
                {label}
              </th>
              <td className="p-3">{cell(free, `${label} on Free`)}</td>
              <td className="p-3">{cell(solo, `${label} on Solo`)}</td>
              <td className="p-3">{cell(pro, `${label} on Pro`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Straight answers to what people ask (KES-131). */
export function Faq() {
  return (
    <section aria-labelledby="faq" className="py-8 desk:py-12">
      <h2 id="faq" className="m-0 text-2xl font-bold">
        Questions people ask
      </h2>
      <div className="mt-5 flex max-w-3xl flex-col gap-3">
        {FAQS.map(({ question, answer }) => (
          <details key={question} className="group rounded-card bg-card px-5 py-4 shadow-card">
            <summary className="cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {question}
                <span aria-hidden="true" className="text-xl text-muted group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 mb-0 text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
