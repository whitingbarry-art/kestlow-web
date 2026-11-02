import { useEffect, useState } from "react";
import type { LeadsPreview, LoadPreview } from "../../../api/preview";
import { TRADES } from "../../../data/leads";
import { LeadCard } from "../../leads/LeadCard";

const nothing = () => {};

/**
 * Real numbers and real recent leads near Bromley (KES-131), from the API, so people see the
 * work before they sign up. The leads are shown exactly as the free plan shows them. If the API
 * can't be reached, the section quietly isn't there.
 */
export function LivePreview({ load }: { load: LoadPreview }) {
  const [preview, setPreview] = useState<LeadsPreview | null | "failed">(null);
  useEffect(() => {
    let current = true;
    load()
      .then((loaded) => current && setPreview(loaded))
      .catch(() => current && setPreview("failed"));
    return () => {
      current = false;
    };
  }, [load]);

  if (preview === "failed") return null;
  return (
    <section aria-labelledby="live" aria-busy={preview === null} className="py-12">
      <h2 id="live" className="m-0 text-2xl font-bold">
        Real work near Bromley
      </h2>
      {preview === null ? (
        <p className="mt-2 mb-0 text-muted">Counting this month's planning applications…</p>
      ) : (
        <>
          <p className="mt-2 mb-0 max-w-2xl text-lg">
            In the last {preview.days} days, <b>{preview.total.toLocaleString("en-GB")}</b> planning
            applications within {preview.radiusMiles} miles of Bromley involved roofing, electrical,
            landscaping or groundworks.
          </p>
          <ul className="mt-4 mb-0 flex flex-wrap gap-2 pl-0">
            {TRADES.map((trade) => (
              <li key={trade} className="list-none rounded-full bg-card px-4 py-2 shadow-card">
                <b>{preview.byTrade[trade].toLocaleString("en-GB")}</b> {trade.toLowerCase()}
              </li>
            ))}
          </ul>
          {preview.examples.length > 0 && (
            <>
              <h3 className="mt-8 mb-1 text-lg font-bold">A few of them</h3>
              <p className="mt-0 mb-4 text-muted">
                Real applications, shown as the free plan shows them: a week late and by area. Solo
                and Pro show the address, the council's page and who applied, the day they're in.
              </p>
              <div className="grid gap-3 desk:grid-cols-2" inert>
                {preview.examples.map((lead) => (
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
            </>
          )}
        </>
      )}
    </section>
  );
}
