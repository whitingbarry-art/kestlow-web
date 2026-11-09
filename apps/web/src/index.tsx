import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { AppProviders } from "./components/AppProviders";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SignedInGate } from "./components/auth/SignedInGate";
import { PricingPage } from "./components/billing/PricingPage";
import { ResetPasswordScreen } from "./components/auth/ResetPasswordScreen";
import { VerifyEmailScreen } from "./components/auth/VerifyEmailScreen";
import { OnboardingGate } from "./components/onboarding/OnboardingGate";
import { AboutPage } from "./components/site/AboutPage";
import { AreaPage } from "./components/site/AreaPage";
import { AreasIndexPage } from "./components/site/AreasIndexPage";
import { AccessibilityPage } from "./components/site/AccessibilityPage";
import { ContactPage } from "./components/site/ContactPage";
import { JobsPage } from "./components/site/JobsPage";
import { LaunchPage } from "./components/site/LaunchPage";
import { LeadEmailsPage } from "./components/site/LeadEmailsPage";
import { LegalPage } from "./components/site/LegalPage";
import { AREAS_INDEX_PATH, areaPageFor } from "./data/areas";
import { JOBS_PATH } from "./data/jobs";
import { PRIVACY, REFUNDS, TERMS } from "./data/legal";
import { createErrorReporter, reportUncaughtErrors } from "./logic/errorReporting";
import { askedForAccount, sourceFrom } from "./logic/signUp";
import "./styles/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

// What breaks in people's browsers is reported (KES-38); not while developing, where it's on screen.
const reporter = createErrorReporter();
if (import.meta.env.PROD) reportUncaughtErrors(reporter);

// The pages emailed links open (KES-40, KES-41) and the ones anyone can read, signed in or not
// (KES-116); everything else is the app.
const token = new URLSearchParams(window.location.search).get("token");
const areaPage = areaPageFor(window.location.pathname);
const pages: Record<string, ReactNode> = {
  "/reset-password": <ResetPasswordScreen token={token} />,
  "/verify-email": <VerifyEmailScreen token={token} />,
  // The links in the free weekly leads emails (KES-137).
  "/leads-by-email/confirm": <LeadEmailsPage action="confirm" token={token} />,
  "/leads-by-email/stop": <LeadEmailsPage action="stop" token={token} />,
  // Jobs near a postcode, with nothing to sign up for (KES-155): where the ads and cards point.
  [JOBS_PATH]: <JobsPage source={sourceFrom(window.location.search)} />,
  "/about": <AboutPage />,
  "/contact": <ContactPage />,
  "/accessibility": <AccessibilityPage />,
  "/terms": <LegalPage document={TERMS} />,
  "/privacy": <LegalPage document={PRIVACY} />,
  "/refunds": <LegalPage document={REFUNDS} />,
  // The town and trade pages search engines find (KES-136).
  [AREAS_INDEX_PATH]: <AreasIndexPage />,
  ...(areaPage && { [window.location.pathname]: <AreaPage {...areaPage} /> }),
  // Plans and Checkout (KES-50): for someone signed in, as Checkout is for their account.
  "/pricing": (
    <SignedInGate>
      <PricingPage />
    </SignedInGate>
  ),
};

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary reporter={import.meta.env.PROD ? reporter : { report: console.error }}>
      <AppProviders>
        {pages[window.location.pathname] ?? (
          // Signed out, kestlow.co.uk is the launch page (KES-131), unless they came to sign in.
          <SignedInGate
            signedOut={
              askedForAccount(window.location.search) ? undefined : (
                <LaunchPage source={sourceFrom(window.location.search)} />
              )
            }
          >
            <OnboardingGate>
              <App />
            </OnboardingGate>
          </SignedInGate>
        )}
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
