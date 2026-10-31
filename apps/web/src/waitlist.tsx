import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LaunchPage } from "./components/site/LaunchPage";
import { sourceFrom } from "./logic/signUp";
import "./styles/index.css";

// The landing page at /waitlist/ (KES-97, now KES-125's launch page): its own entry, so it doesn't
// load the app or the map. The address stays, as the counter cards' QR codes point here.
const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    {/* Counter cards and ads say where they're from, e.g. ?ref=screwfix-bromley (KES-121). */}
    <LaunchPage source={sourceFrom(window.location.search)} />
  </StrictMode>,
);
