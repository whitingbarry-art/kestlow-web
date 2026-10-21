import type { TradeFilter } from "../../types/lead";
import { Chip } from "../ui/Chip";

interface TradeFiltersProps {
  options: TradeFilter[];
  active: TradeFilter;
  onSelect: (trade: TradeFilter) => void;
}

export function TradeFilters({ options, active, onSelect }: TradeFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3" role="group" aria-label="Filter by trade">
      {options.map((trade) => (
        <Chip key={trade} label={trade} active={trade === active} onSelect={() => onSelect(trade)} />
      ))}
    </div>
  );
}
