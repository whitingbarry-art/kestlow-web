import { createHttpSendContact, type SendContact } from "../../api/contact";
import { BUSINESS_ADDRESS, CONTACT } from "../../data/contact";
import { useSession } from "../../hooks/useSession";
import { ContactForm } from "./ContactForm";
import { PublicLayout } from "./PublicLayout";

const ADDRESSES = [
  { label: "Help using Kestlow", email: CONTACT.support },
  { label: "Billing", email: CONTACT.billing },
  { label: "Privacy and your data", email: CONTACT.privacy },
  { label: "Anything else", email: CONTACT.hello },
];

const httpSend = createHttpSendContact();

/** Contact us (KES-116): a form for help and feedback, and the addresses for anyone who'd rather email. */
export function ContactPage({ send = httpSend }: { send?: SendContact }) {
  // Someone signed in doesn't need to type their name and email again.
  const session = useSession();
  const user = session.data;

  return (
    <PublicLayout title="Contact us">
      <p className="mt-0 mb-8 text-lg leading-relaxed">
        Questions, ideas, or something not working as it should? Send us a message and we'll get
        back to you.
      </p>
      {session.isPending ? null : <ContactForm send={send} name={user?.name} email={user?.email} />}

      <section aria-labelledby="contact-email" className="mt-12 border-t border-line pt-8">
        <h2 id="contact-email" className="mt-0 mb-3 text-xl font-bold">
          Rather email?
        </h2>
        <dl className="m-0 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
          {ADDRESSES.map((address) => (
            <div key={address.email} className="contents">
              <dt className="font-semibold">{address.label}</dt>
              <dd className="m-0 mb-2 sm:mb-0">
                <a href={`mailto:${address.email}`} className="font-semibold text-ink underline">
                  {address.email}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="contact-post" className="mt-10">
        <h2 id="contact-post" className="mt-0 mb-3 text-xl font-bold">
          By post
        </h2>
        {/* One line each, as an address is written on an envelope. */}
        <address className="not-italic">
          {["Kestlow", ...BUSINESS_ADDRESS.split(", ")].map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
        <p className="mt-2 mb-0 text-muted">
          Post is scanned and sent on to us, so email is quicker.
        </p>
      </section>
    </PublicLayout>
  );
}
