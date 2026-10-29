import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { AppProviders } from "./components/AppProviders";
import { SignedInGate } from "./components/auth/SignedInGate";
import { ResetPasswordScreen } from "./components/auth/ResetPasswordScreen";
import { VerifyEmailScreen } from "./components/auth/VerifyEmailScreen";
import { OnboardingGate } from "./components/onboarding/OnboardingGate";
import { AboutPage } from "./components/site/AboutPage";
import { ContactPage } from "./components/site/ContactPage";
import { LegalPage } from "./components/site/LegalPage";
import { PRIVACY, REFUNDS, TERMS } from "./data/legal";
import "./styles/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

// The pages emailed links open (KES-40, KES-41) and the ones anyone can read, signed in or not
// (KES-116); everything else is the app.
const token = new URLSearchParams(window.location.search).get("token");
const pages: Record<string, ReactNode> = {
  "/reset-password": <ResetPasswordScreen token={token} />,
  "/verify-email": <VerifyEmailScreen token={token} />,
  "/about": <AboutPage />,
  "/contact": <ContactPage />,
  "/terms": <LegalPage document={TERMS} />,
  "/privacy": <LegalPage document={PRIVACY} />,
  "/refunds": <LegalPage document={REFUNDS} />,
};

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      {pages[window.location.pathname] ?? (
        <SignedInGate>
          <OnboardingGate>
            <App />
          </OnboardingGate>
        </SignedInGate>
      )}
    </AppProviders>
  </StrictMode>,
);
