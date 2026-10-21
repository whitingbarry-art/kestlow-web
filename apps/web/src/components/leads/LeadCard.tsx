import type { MouseEvent } from "react";
import type { Lead } from "../../types/lead";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LeadTags } from "./LeadTags";
import { NewBadge } from "./NewBadge";
import { SaveButton } from "./SaveButton";

interface LeadCardProps {
  lead: Lead;
  selected: boolean;
  saved: boolean;
  clickable: boolean;
  onOpen: (id: number) => void;
  onToggleSave: (id: number) => void;
}

export function LeadCard({ lead, selected, saved, clickable, onOpen, onToggleSave }: LeadCardProps) {
  const handleView = (event: MouseEvent) => {
    event.stopPropagation();
    onOpen(lead.id);
  };

  return (
    <Card
      selected={selected}
      className={cn(clickable && "cursor-pointer")}
      onClick={clickable ? () => onOpen(lead.id) : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[17px] font-bold">{lead.address}</div>
          <div className="mt-0.5 text-sm text-muted">
            {lead.council} &middot; {lead.miles} miles
          </div>
        </div>
        {lead.isNew && <NewBadge />}
      </div>
      <div className="my-2.5 text-[15px]">{lead.description}</div>
      <LeadTags lead={lead} showReceived />
      <div className="flex gap-2">
        <Button onClick={handleView}>View lead</Button>
        <SaveButton saved={saved} onToggle={() => onToggleSave(lead.id)} />
      </div>
    </Card>
  );
}
