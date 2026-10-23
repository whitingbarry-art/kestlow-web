const DAY_MS = 24 * 60 * 60 * 1000;

const londonDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" });
const displayDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Today's date in the UK as YYYY-MM-DD, as the API counts "new today". */
export function londonToday(now: Date = new Date()): string {
  return londonDate.format(now);
}

/** The UK date `days` days before `now`, as YYYY-MM-DD. */
export function daysAgo(days: number, now: Date = new Date()): string {
  return londonToday(new Date(now.getTime() - days * DAY_MS));
}

/** A YYYY-MM-DD date as "18 Dec 2026". */
export function formatDate(date: string): string {
  return displayDate.format(new Date(`${date}T00:00:00Z`));
}

/** When a lead was received: "Today", "Yesterday", "3 days ago", then the date after a week. */
export function formatReceived(receivedAt: string, today: string = londonToday()): string {
  const days = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${receivedAt}T00:00:00Z`)) / DAY_MS,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;
  return formatDate(receivedAt);
}
