import { formatLeadDistance } from "../../logic/leads";
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
        {lead.council} &middot; {formatLeadDistance(lead)} away
      </div>
      <LeadMap location={lead.location} address={lead.address} rough={lead.masked} />
      {lead.masked ? (
        <p className="mt-2 mb-0 text-sm text-muted">
          On the free plan you see the area, not the exact address. Solo and Pro show the address,
          the council page and who applied.
        </p>
      ) : (
        lead.approximate && (
          <p className="mt-2 mb-0 text-sm text-muted">
            The application doesn't give a full address, so the map shows roughly where it is. The
            council page has the exact site.
          </p>
        )
      )}
      <p className="my-4">{lead.description}</p>
      <LeadTags lead={lead} />
      <LeadFacts lead={lead} />
      <div className="flex gap-2">
        {lead.sourceUrl ? (
          <a
            href={lead.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName("primary")}
          >
            Open council page <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <a href="/pricing" className={buttonClassName("primary")}>
            See the address
          </a>
        )}
        <SaveButton saved={saved} onToggle={() => onToggleSave(lead.id)} />
      </div>
    </article>
  );
}
