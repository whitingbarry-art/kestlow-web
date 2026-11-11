import { AREA_COUNCILS, AREA_TRADES, AREAS_INDEX_META, areaPath, COVERAGE } from "../../data/areas";
import { PublicLayout } from "./PublicLayout";

const linkClass = "font-semibold text-ink underline";

/** Every town and trade page (KES-136), one council at a time, for people and search engines. */
export function AreasIndexPage() {
  return (
    <PublicLayout title={AREAS_INDEX_META.heading} description={AREAS_INDEX_META.description}>
      <div className="flex flex-col gap-6 text-lg leading-relaxed">
        <p className="m-0">
          Kestlow covers {COVERAGE}, with more to come. Pick your area and trade to see last month's
          planning applications.
        </p>
        {AREA_COUNCILS.map((council) => (
          <section key={council.slug} aria-labelledby={`areas-${council.slug}`}>
            <h2 id={`areas-${council.slug}`} className="mt-0 mb-1 text-xl font-bold">
              {council.name}{" "}
              <span className="text-base font-normal text-muted">{council.region}</span>
            </h2>
            <ul className="m-0 flex flex-wrap gap-x-5 gap-y-1 p-0">
              {AREA_TRADES.map((trade) => (
                <li key={trade.slug} className="list-none">
                  <a href={areaPath(trade, council)} className={linkClass}>
                    {trade.trade} leads in {council.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PublicLayout>
  );
}
