import { BUSINESS_ADDRESS } from "../../data/contact";
import { OWNER } from "../../data/legal";
import { SITE_LINKS } from "../../data/navigation";
import { cn } from "../../utils/cn";

interface SiteFooterProps {
  className?: string;
}

/** Links to About us and Contact us, at the foot of every page. */
export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("px-4 py-6 text-sm text-muted", className)}>
      <nav aria-label="About Kestlow">
        <ul className="m-0 flex list-none flex-wrap justify-center gap-x-5 gap-y-2 p-0">
          {SITE_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="font-semibold text-ink underline">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-3 mb-0 text-center">
        {/* The postcode never splits across two lines. */}© {new Date().getFullYear()} {OWNER},{" "}
        {BUSINESS_ADDRESS.replace(/ (\S+)$/, "\u00a0$1")}
      </p>
    </footer>
  );
}
