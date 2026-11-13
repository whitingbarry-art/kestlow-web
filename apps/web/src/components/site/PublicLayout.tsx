import type { ReactNode } from "react";
import { pageTitle } from "../../data/site";
import { usePageMeta } from "../../hooks/usePageMeta";
import { BrandLogo } from "../ui/BrandLogo";
import { SiteFooter } from "./SiteFooter";

interface PublicLayoutProps {
  /** The page's name, for its heading and the browser tab. */
  title: string;
  /** What search results say about the page (KES-135); pages left out of search have none. */
  description?: string;
  /**
   * The "Back to Kestlow" link; left off the jobs page (KES-168), where it was the most visible
   * thing on a phone and led away from the one thing an ad visitor came for.
   */
  homeLink?: boolean;
  children: ReactNode;
}

/** The pages anyone can read (KES-116): the brand header, a readable column and the footer. */
export function PublicLayout({ title, description, homeLink = true, children }: PublicLayoutProps) {
  usePageMeta({ title: pageTitle(title), description });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="brand-surface py-5 [--focus:#ffffff]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4">
          <BrandLogo />
          {homeLink && (
            <a href="/" className="rounded-lg font-semibold text-white underline">
              Back to Kestlow
            </a>
          )}
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="mt-0 mb-6 text-3xl font-bold">{title}</h1>
        {children}
      </main>
      <SiteFooter className="border-t border-line" />
    </div>
  );
}
