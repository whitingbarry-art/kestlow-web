export function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-new-bg px-2.5 py-1 text-xs font-bold text-new-text">
      <span className="size-2 rounded-full bg-amber" aria-hidden="true" />
      New
    </span>
  );
}
