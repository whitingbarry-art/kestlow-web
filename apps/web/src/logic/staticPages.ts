import { SITE_URL } from "../data/site";
import type { StaticPageMeta } from "../data/areas";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Replaces the content="…" of the tag that has `attribute`, such as name="description". */
function setContent(html: string, attribute: string, value: string): string {
  const tag = new RegExp(`(<meta\\s+${attribute}\\s+content=")[^"]*(")`);
  if (!tag.test(html)) throw new Error(`index.html has no <meta ${attribute}>`);
  return html.replace(tag, `$1${escape(value)}$2`);
}

/**
 * The built index.html with `page`'s title, description, link-preview tags and canonical address
 * written in (KES-136), so search engines and link previews read them without running the app.
 */
export function withPageMeta(html: string, page: StaticPageMeta): string {
  const url = `${SITE_URL}${page.path}`;
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`);
  out = setContent(out, 'name="description"', page.description);
  out = setContent(out, 'property="og:title"', page.title);
  out = setContent(out, 'property="og:description"', page.description);
  out = setContent(out, 'property="og:url"', url);
  return out.replace("</head>", `    <link rel="canonical" href="${url}" />\n  </head>`);
}
