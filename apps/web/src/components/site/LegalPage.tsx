import { Fragment } from "react";
import type { LegalBlock, LegalDocument } from "../../data/legal";
import { PublicLayout } from "./PublicLayout";

// Email addresses and web addresses, which become links.
const LINKABLE = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+|https?:\/\/[^\s,)]+[^\s,).])/g;

/** Text with its email and web addresses as links. */
function Linked({ text }: { text: string }) {
  return text.split(LINKABLE).map((part, index) => {
    // split with one capture group puts the matches at the odd indexes.
    if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;
    const href = part.includes("@") ? `mailto:${part}` : part;
    return (
      <a key={index} href={href} className="font-semibold break-words text-ink underline">
        {part}
      </a>
    );
  });
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string")
    return (
      <p className="mt-0 mb-3">
        <Linked text={block} />
      </p>
    );
  return (
    <ul className="mt-0 mb-3 flex list-disc flex-col gap-2 pl-6">
      {block.list.map((item) => (
        <li key={item}>
          <Linked text={item} />
        </li>
      ))}
    </ul>
  );
}

/** A privacy notice, terms or policy (KES-37), from its words in data/legal.ts. */
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <PublicLayout title={document.title}>
      <div className="leading-relaxed">
        <p className="mt-0 mb-6 text-sm text-muted">Last updated {document.updated}</p>
        {document.intro.map((text) => (
          <p key={text} className="mt-0 mb-6 text-lg">
            <Linked text={text} />
          </p>
        ))}
        {document.sections.map((section) => (
          <section key={section.heading} className="mb-6">
            <h2 className="mt-0 mb-2 text-xl font-bold">{section.heading}</h2>
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </section>
        ))}
      </div>
    </PublicLayout>
  );
}
