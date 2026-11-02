import { SAMPLE_LEADS } from "../../../data/leads";
import { BrandLogo } from "../../ui/BrandLogo";
import { LeadCard } from "../../leads/LeadCard";

const nothing = () => {};

/**
 * A phone showing Kestlow's own lead cards (KES-131), with the made-up sample leads, so the
 * picture is the real app without anyone's real address. Only a picture: it can't be focused or
 * clicked, and screen readers hear its caption instead.
 */
export function PhoneMockup() {
  return (
    <figure className="m-0">
      <div
        aria-hidden="true"
        inert
        className="mx-auto w-[250px] overflow-hidden rounded-[2.25rem] border-[9px] border-navy bg-page text-ink shadow-[0_24px_60px_rgb(0_0_0/0.4)]"
      >
        <div className="brand-surface flex items-center justify-between px-4 py-3">
          <BrandLogo />
        </div>
        <div className="px-3 pt-3 pb-1">
          <p className="m-0 text-lg font-bold">New leads near you</p>
          <p className="m-0 mb-2 text-sm text-muted">2 new today</p>
        </div>
        <div className="flex h-[270px] flex-col gap-3 overflow-hidden px-2.5 pb-3 text-[13px] [&_h3]:text-base">
          {SAMPLE_LEADS.slice(0, 2).map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selected={false}
              saved={false}
              clickable={false}
              onOpen={nothing}
              onToggleSave={nothing}
            />
          ))}
        </div>
      </div>
      <figcaption className="mt-2 text-center text-xs text-side-link">
        Kestlow on a phone, with example leads
      </figcaption>
    </figure>
  );
}
