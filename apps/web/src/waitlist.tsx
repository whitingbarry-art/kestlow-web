import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHttpJoinWaitlist } from "./api/waitlist";
import { WaitlistPage } from "./components/waitlist/WaitlistPage";
import "./styles/index.css";

// The landing page at /waitlist/ (KES-97): its own entry, so it doesn't load the app or the map.
const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    <WaitlistPage
      join={createHttpJoinWaitlist()}
      // Counter cards' QR codes say which shop they're from, e.g. ?ref=screwfix-bromley (KES-121).
      source={new URLSearchParams(window.location.search).get("ref") ?? undefined}
    />
  </StrictMode>,
);
