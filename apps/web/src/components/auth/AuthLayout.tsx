import type { ReactNode } from "react";
import { SiteFooter } from "../site/SiteFooter";
import { BrandLogo } from "../ui/BrandLogo";

/** The page around the signed-out screens: the brand header, a narrow column and the footer. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="brand-surface py-5 [--focus:#ffffff]">
        <div className="mx-auto max-w-md px-4">
          <BrandLogo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
