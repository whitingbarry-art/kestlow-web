import { CONTACT } from "../../data/contact";
import { PublicLayout } from "./PublicLayout";

const linkClass = "font-semibold text-ink underline";
const listClass = "mt-3 mb-0 flex list-disc flex-col gap-2 pl-6";

/** When this page last changed; update it whenever what it says changes. */
const ACCESSIBILITY_UPDATED = "3 November 2026";

/**
 * How well Kestlow works for everyone, honestly (KES-132): what we aim for, what we check, what
 * doesn't work well yet and how to tell us. Never "fully accessible" or "certified".
 */
export function AccessibilityPage() {
  return (
    <PublicLayout title="Accessibility">
      <div className="flex flex-col gap-8 text-lg leading-relaxed">
        <p className="m-0 text-base text-muted">Last updated {ACCESSIBILITY_UPDATED}.</p>

        <section aria-labelledby="a11y-aim">
          <h2 id="a11y-aim" className="mt-0 mb-2 text-xl font-bold">
            What we aim for
          </h2>
          <p className="m-0">
            We want Kestlow to be easy for everyone to use: on a phone in bright sunlight, with
            colour blindness or dyslexia, with a keyboard instead of a mouse, or with a screen
            reader. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.
            Nobody has audited Kestlow independently yet, so we don't claim to meet them in full.
          </p>
        </section>

        <section aria-labelledby="a11y-can">
          <h2 id="a11y-can" className="mt-0 mb-2 text-xl font-bold">
            What you should be able to do
          </h2>
          <ul className={listClass}>
            <li>Use every page with a keyboard alone, and always see where you are on the page.</li>
            <li>
              Use a screen reader: pages have headings, buttons and fields are labelled, and a form
              that needs fixing lists what's wrong and takes you to each answer.
            </li>
            <li>Zoom in, or use a narrow screen, without text being cut off.</li>
            <li>
              Choose light or dark. Kestlow starts with your device's setting, and you can switch
              once you're signed in.
            </li>
            <li>
              Rely on more than colour: anything shown in colour also has words or a symbol, such as
              the ticks and dashes on our plans.
            </li>
            <li>Turn off animation in your device's settings, and Kestlow keeps still.</li>
            <li>Use your device's high contrast mode.</li>
          </ul>
        </section>

        <section aria-labelledby="a11y-test">
          <h2 id="a11y-test" className="mt-0 mb-2 text-xl font-bold">
            How we check
          </h2>
          <ul className={listClass}>
            <li>
              Every screen is checked automatically against the WCAG 2.2 AA rules, on phone and
              desktop sizes, before any change goes live. Anything the checks find is fixed first.
            </li>
            <li>
              Our tests also use Kestlow the way people do, in a desktop browser and on a phone,
              including moving through forms with a keyboard.
            </li>
          </ul>
          <p className="mt-3 mb-0">
            Automatic checks only catch some problems, so we're also arranging sessions with people
            who use screen readers. We'll update this page with what we learn.
          </p>
        </section>

        <section aria-labelledby="a11y-gaps">
          <h2 id="a11y-gaps" className="mt-0 mb-2 text-xl font-bold">
            What doesn't work well yet
          </h2>
          <ul className={listClass}>
            <li>
              The map on each lead is a picture, so it's no help without sight. The address or area
              is always written out beside it too. "Open a larger map" goes to OpenStreetMap, which
              we don't run.
            </li>
            <li>
              Paying and managing your plan happen on Stripe's pages, and the details of each
              planning application are on the council's own website. We can't change how those work,
              but tell us if one gets in your way and we'll help another way.
            </li>
            <li>Nobody who uses a screen reader has tested Kestlow with us yet.</li>
          </ul>
        </section>

        <section aria-labelledby="a11y-tell">
          <h2 id="a11y-tell" className="mt-0 mb-2 text-xl font-bold">
            Tell us about a problem
          </h2>
          <p className="m-0">
            If something is hard to use, or you need information in another way, please tell us.
            Email{" "}
            <a href={`mailto:${CONTACT.support}`} className={linkClass}>
              {CONTACT.support}
            </a>{" "}
            or use the{" "}
            <a href="/contact" className={linkClass}>
              contact form
            </a>
            . Say which page you were on and what happened. We aim to reply within two working days,
            and we'll tell you what we're doing about it.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}
