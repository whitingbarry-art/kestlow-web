import type { Lead } from "../../types/lead";
import { buttonClassName } from "../ui/buttonStyles";
import { LeadFacts } from "./LeadFacts";
import { LeadTags } from "./LeadTags";
import { LeadMap } from "./LeadMap";
import { SaveButton } from "./SaveButton";

interface LeadDetailProps {
  lead: Lead;
  saved: boolean;
  onToggleSave: (id: string) => void;
}

export function LeadDetail({ lead, saved, onToggleSave }: LeadDetailProps) {
  return (
    <article>
      <h2 className="m-0 text-[22px] font-bold">{lead.address}</h2>
      <div className="mt-0.5 text-sm text-muted">
        {lead.council} &middot; {lead.miles} miles away
      </div>
      <LeadMap location={lead.location} address={lead.address} />
      <p className="my-4">{lead.description}</p>
      <LeadTags lead={lead} />
      <LeadFacts lead={lead} />
      <div className="flex gap-2">
        <a
          href={lead.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName("primary")}
        >
          Open council page <span className="sr-only">(opens in a new tab)</span>
        </a>
        <SaveButton saved={saved} onToggle={() => onToggleSave(lead.id)} />
      </div>
    </article>
  );
}
