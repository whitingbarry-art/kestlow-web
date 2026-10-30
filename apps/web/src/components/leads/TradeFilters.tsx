import type { TradeFilter } from "../../types/lead";
import { Chip } from "../ui/Chip";
import { ScrollRow } from "../ui/ScrollRow";

interface TradeFiltersProps {
  options: TradeFilter[];
  active: TradeFilter;
  onSelect: (trade: TradeFilter) => void;
  /** Trades their plan doesn't cover (KES-52), shown after the rest with a padlock. */
  locked?: TradeFilter[];
  onSelectLocked?: (trade: TradeFilter) => void;
}

export function TradeFilters({
  options,
  active,
  onSelect,
  locked = [],
  onSelectLocked,
}: TradeFiltersProps) {
  return (
    // Always one line: when the buttons don't all fit, its arrows (or a swipe) move it along.
    <ScrollRow className="flex gap-2 px-4 py-3" role="group" aria-label="Filter by trade">
      {options.map((trade) => (
        <Chip
          key={trade}
          label={trade}
          active={trade === active}
          onSelect={() => onSelect(trade)}
        />
      ))}
      {locked.map((trade) => (
        <Chip
          key={trade}
          label={trade}
          active={false}
          locked
          onSelect={() => onSelectLocked?.(trade)}
        />
      ))}
    </ScrollRow>
  );
}
