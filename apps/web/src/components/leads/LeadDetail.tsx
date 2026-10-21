import type { Lead } from "../../types/lead";
import { Button } from "../ui/Button";
import { LeadFacts } from "./LeadFacts";
import { LeadTags } from "./LeadTags";
import { MapPlaceholder } from "./MapPlaceholder";
import { SaveButton } from "./SaveButton";

interface LeadDetailProps {
  lead: Lead;
  saved: boolean;
  onToggleSave: (id: number) => void;
}

export function LeadDetail({ lead, saved, onToggleSave }: LeadDetailProps) {
  return (
    <article>
      <h2 className="m-0 text-[22px] font-bold">{lead.address}</h2>
      <div className="mt-0.5 text-sm text-muted">
        {lead.council} &middot; {lead.miles} miles away
      </div>
      <MapPlaceholder />
      <p className="my-4">{lead.description}</p>
      <LeadTags lead={lead} />
      <LeadFacts lead={lead} />
      <div className="flex gap-2">
        <Button>Open council page</Button>
        <SaveButton saved={saved} onToggle={() => onToggleSave(lead.id)} />
      </div>
      <p className="my-4 text-xs text-muted">Sample data for design purposes only.</p>
    </article>
  );
}
