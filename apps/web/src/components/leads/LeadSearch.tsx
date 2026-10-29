import { Search, X } from "lucide-react";
import { useId } from "react";
import type { LeadSort } from "../../types/lead";
import { cn } from "../../utils/cn";
import { inputClassName } from "../ui/inputStyles";

interface LeadSearchProps {
  /** What's typed in the box. */
  text: string;
  onTextChange: (text: string) => void;
  onClear: () => void;
  /** The search the results are for, once typing pauses. */
  search: string;
  /** How many leads match, or undefined while the first results load. */
  total: number | undefined;
  sortOptions: { value: LeadSort; label: string }[];
  sort: LeadSort;
  onSortChange: (sort: LeadSort) => void;
}

const leadsCount = (count: number) => `${count} ${count === 1 ? "lead" : "leads"}`;

/** Search leads by town, street or postcode, and choose their order (KES-115). */
export function LeadSearch({
  text,
  onTextChange,
  onClear,
  search,
  total,
  sortOptions,
  sort,
  onSortChange,
}: LeadSearchProps) {
  const id = useId();
  // Only while searching: otherwise the page heading already says how many there are (KES-120).
  const count =
    total === undefined || !search
      ? ""
      : `${leadsCount(total)} ${total === 1 ? "matches" : "match"} “${search}”`;

  return (
    <div role="search" className="px-4 pt-3">
      <label htmlFor={`${id}-search`} className="sr-only">
        Search leads by town, street or postcode
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
        />
        <input
          id={`${id}-search`}
          type="search"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && text) {
              event.preventDefault();
              onClear();
            }
          }}
          placeholder="Search by town or postcode"
          autoComplete="off"
          enterKeyHint="search"
          className={inputClassName(
            false,
            cn("mt-0 pl-10", text && "pr-11", "[&::-webkit-search-cancel-button]:hidden"),
          )}
        />
        {text && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-ink"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p aria-live="polite" className="m-0 text-sm text-muted">
          {count}
        </p>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as LeadSort)}
            className="rounded-xl border-2 border-muted bg-card px-2 py-1.5 text-sm text-ink"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
