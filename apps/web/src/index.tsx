import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { AppProviders } from "./components/AppProviders";
import { SignedInGate } from "./components/auth/SignedInGate";
import { OnboardingGate } from "./components/onboarding/OnboardingGate";
import "./styles/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <SignedInGate>
        <OnboardingGate>
          <App />
        </OnboardingGate>
      </SignedInGate>
    </AppProviders>
  </StrictMode>,
);
