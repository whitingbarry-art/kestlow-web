import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { AppProviders } from "./components/AppProviders";
import { SignedInGate } from "./components/auth/SignedInGate";
import "./styles/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <SignedInGate>
        <App />
      </SignedInGate>
    </AppProviders>
  </StrictMode>,
);
