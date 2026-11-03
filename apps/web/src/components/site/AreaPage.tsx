import { useEffect, useState } from "react";
import {
  createCouncilPreviewLoader,
  type CouncilPreview,
  type LoadCouncilPreview,
} from "../../api/councilPreview";
import {
  AREA_COUNCILS,
  AREA_TRADES,
  AREAS_INDEX_PATH,
  areaPageMeta,
  areaPath,
  type AreaPageInfo,
} from "../../data/areas";
import { recordStep as defaultRecordStep, type RecordStep } from "../../logic/funnel";
import { signUpHref } from "../../logic/signUp";
import { LeadCard } from "../leads/LeadCard";
import { buttonClassName } from "../ui/buttonStyles";
import { PublicLayout } from "./PublicLayout";

const linkClass = "font-semibold text-ink underline";
const nothing = () => {};
const defaultLoad = createCouncilPreviewLoader();

interface AreaPageProps extends AreaPageInfo {
  load?: LoadCouncilPreview;
  recordStep?: RecordStep;
}

/**
 * A town and trade page for search engines (KES-136), such as "Roofing leads in Bromley": what
 * the trade's leads are, how many the council had last month and a few as the free plan shows
 * them. Its ref (seo-roofing-bromley) follows people to sign-up, so we can see which pages work.
 */
export function AreaPage({
  trade,
  council,
  load = defaultLoad,
  recordStep = defaultRecordStep,
}: AreaPageProps) {
  const { heading, description } = areaPageMeta({ trade, council });
  const source = `seo-${trade.slug}-${council.slug}`;
  const start = signUpHref(source);
  useEffect(() => recordStep("launch_viewed", { source }), [recordStep, source]);

  const [preview, setPreview] = useState<CouncilPreview | null | "failed">(null);
  useEffect(() => {
    let current = true;
    load(council.name)
      .then((loaded) => current && setPreview(loaded))
      .catch(() => current && setPreview("failed"));
    return () => {
      current = false;
    };
  }, [load, council.name]);

  const trial = (
    <a
      href={start}
      onClick={() => recordStep("trial_tapped", { source })}
      className={buttonClassName("primary", "self-start")}
    >
      Start your free 14-day trial
    </a>
  );

  return (
    <PublicLayout title={heading} description={description}>
      <div className="flex flex-col gap-8 text-lg leading-relaxed">
        <p className="m-0">
          Kestlow picks out the new planning applications in {council.name} that could need{" "}
          {trade.someone}: {trade.work}. They're on your phone by 7:30 every morning, so you can be
          in touch while the work is still being planned.
        </p>

        {preview !== "failed" && (
          <section aria-labelledby="area-numbers" aria-busy={preview === null}>
            <h2 id="area-numbers" className="mt-0 mb-2 text-xl font-bold">
              {trade.trade} work in {council.name} last month
            </h2>
            {preview === null ? (
              <p className="m-0 text-muted">Counting this month's planning applications…</p>
            ) : (
              <>
                <p className="m-0">
                  In the last {preview.days} days,{" "}
                  <b>{preview.byTrade[trade.trade].toLocaleString("en-GB")}</b> planning
                  applications in {council.name} could need {trade.someone}.
                </p>
                {preview.examples[trade.trade].length > 0 && (
                  <>
                    <h3 className="mt-6 mb-1 text-lg font-bold">A few of them</h3>
                    <p className="mt-0 mb-4 text-base text-muted">
                      Real applications, shown as the free plan shows them: a week late and by area.
                      Solo and Pro show the address, the council's page and, if a company applied,
                      its name, the day they're in.
                    </p>
                    <ul className="m-0 flex flex-col gap-3 p-0">
                      {preview.examples[trade.trade].map((lead) => (
                        <li key={lead.id} className="list-none">
                          <LeadCard
                            lead={lead}
                            selected={false}
                            saved={false}
                            clickable={false}
                            onOpen={nothing}
                            onToggleSave={nothing}
                            actions={false}
                            distance={false}
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </section>
        )}

        <section aria-labelledby="area-start" className="flex flex-col gap-3">
          <h2 id="area-start" className="m-0 text-xl font-bold">
            Try it free
          </h2>
          <p className="m-0">
            Pro is free for 14 days, with no card needed. After that, Solo is £29 a month for one
            trade, or carry on with the free plan.
          </p>
          {trial}
        </section>

        <section aria-labelledby="area-source">
          <h2 id="area-source" className="mt-0 mb-2 text-xl font-bold">
            Where the leads come from
          </h2>
          <p className="m-0">
            Councils publish planning applications on their public planning registers. Kestlow
            checks {council.name}'s every night and tags each application with the trades it's
            likely to need, from what the application says. We never show the names of private
            people who apply, only of companies.{" "}
            <a href="/about" className={linkClass}>
              More about Kestlow
            </a>
            .
          </p>
        </section>

        <nav aria-labelledby="area-more" className="text-base">
          <h2 id="area-more" className="mt-0 mb-2 text-xl font-bold">
            More leads nearby
          </h2>
          <p className="mt-0 mb-1 font-semibold">Other trades in {council.name}</p>
          <ul className="mt-0 mb-4 flex flex-wrap gap-x-5 gap-y-1 p-0">
            {AREA_TRADES.filter((t) => t !== trade).map((other) => (
              <li key={other.slug} className="list-none">
                <a href={areaPath(other, council)} className={linkClass}>
                  {other.trade} leads in {council.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-0 mb-1 font-semibold">{trade.trade} in other areas</p>
          <ul className="mt-0 mb-4 flex flex-wrap gap-x-5 gap-y-1 p-0">
            {AREA_COUNCILS.filter((c) => c !== council).map((other) => (
              <li key={other.slug} className="list-none">
                <a href={areaPath(trade, other)} className={linkClass}>
                  {other.name}
                </a>
              </li>
            ))}
          </ul>
          <a href={AREAS_INDEX_PATH} className={linkClass}>
            Every town and trade
          </a>
        </nav>
      </div>
    </PublicLayout>
  );
}
