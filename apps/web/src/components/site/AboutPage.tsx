import { CONTACT } from "../../data/contact";
import { DATA_CONTROLLER } from "../../data/waitlist";
import { PublicLayout } from "./PublicLayout";

const linkClass = "font-semibold text-ink underline";

/** Who runs Kestlow, who it's for, and where its leads come from (KES-116). */
export function AboutPage() {
  return (
    <PublicLayout title="About us">
      <div className="flex flex-col gap-8 text-lg leading-relaxed">
        <section aria-labelledby="about-what">
          <h2 id="about-what" className="mt-0 mb-2 text-xl font-bold">
            What Kestlow does
          </h2>
          <p className="m-0">
            Every extension, loft conversion and new build starts with a planning application.
            Kestlow reads the new ones near you each day and tells you about the jobs that need your
            trade, so you can be first in touch, long before the work goes out to quote.
          </p>
        </section>

        <section aria-labelledby="about-who">
          <h2 id="about-who" className="mt-0 mb-2 text-xl font-bold">
            Who it's for
          </h2>
          <p className="m-0">
            Roofers, electricians, landscapers and groundworkers: small firms and sole traders who
            would rather spend their time on the tools than chasing leads, and who'd rather pay one
            simple price than pay for every lead.
          </p>
        </section>

        <section aria-labelledby="about-data">
          <h2 id="about-data" className="mt-0 mb-2 text-xl font-bold">
            Where the leads come from
          </h2>
          <p className="m-0">
            Planning applications are public. Councils publish them on their planning registers so
            anyone can see what's proposed nearby. For now we collect them through{" "}
            <a href="https://www.planit.org.uk" className={linkClass}>
              PlanIt
            </a>
            , which gathers councils' registers in one place, and every lead links to the council's
            own page so you can check the details. We're starting with eight councils in south-east
            London, Kent and Surrey, and adding more as we grow.
          </p>
          <p className="mt-3 mb-0">
            We don't keep the names of private householders who apply, only of companies.
          </p>
        </section>

        <section aria-labelledby="about-us">
          <h2 id="about-us" className="mt-0 mb-2 text-xl font-bold">
            Who we are
          </h2>
          <p className="m-0">
            Kestlow is a small, independent business run by {DATA_CONTROLLER.name}, a software
            engineer who saw how much work tradespeople were missing out on. We'd love to hear from
            you, whether it's a question, an idea or something that isn't working:{" "}
            <a href="/contact" className={linkClass}>
              get in touch
            </a>{" "}
            or email{" "}
            <a href={`mailto:${CONTACT.hello}`} className={linkClass}>
              {CONTACT.hello}
            </a>
            .
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}
