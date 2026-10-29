import { useEffect, type ReactNode } from "react";
import { BrandLogo } from "../ui/BrandLogo";
import { SiteFooter } from "./SiteFooter";

interface PublicLayoutProps {
  /** The page's name, for its heading and the browser tab. */
  title: string;
  children: ReactNode;
}

/** The pages anyone can read (KES-116): the brand header, a readable column and the footer. */
export function PublicLayout({ title, children }: PublicLayoutProps) {
  useEffect(() => {
    document.title = `${title} – Kestlow`;
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="brand-surface py-5 [--focus:#ffffff]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4">
          <BrandLogo />
          <a href="/" className="rounded-lg font-semibold text-white underline">
            Back to Kestlow
          </a>
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
