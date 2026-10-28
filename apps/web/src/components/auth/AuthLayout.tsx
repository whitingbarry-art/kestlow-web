import type { ReactNode } from "react";
import { BrandLogo } from "../ui/BrandLogo";

/** The page around the signed-out screens: the brand header and a narrow column. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="brand-surface py-5 [--focus:#ffffff]">
        <div className="mx-auto max-w-md px-4">
          <BrandLogo />
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-10">{children}</main>
    </div>
  );
}
