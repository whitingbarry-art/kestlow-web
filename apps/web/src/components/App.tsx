import { useEffect } from "react";
import { NAV_ITEMS } from "../data/navigation";
import { useAlertSettings } from "../hooks/useAlertSettings";
import { useLeads } from "../hooks/useLeads";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useNavigation } from "../hooks/useNavigation";
import { useSession, useSignOut } from "../hooks/useSession";
import { useTheme } from "../hooks/useTheme";
import { VerifyEmailBanner } from "./auth/VerifyEmailBanner";
import { BottomNav } from "./layout/BottomNav";
import { DetailPanel } from "./layout/DetailPanel";
import { Sidebar } from "./layout/Sidebar";
import { TopBar } from "./layout/TopBar";
import { LeadDetail } from "./leads/LeadDetail";
import { AccountView } from "./views/AccountView";
import { AlertsView } from "./views/AlertsView";
import { LeadsView } from "./views/LeadsView";
import { SavedView } from "./views/SavedView";

export function App() {
  const isDesktop = useIsDesktop();
  const { toggleTheme } = useTheme();
  const leads = useLeads({ selectFirstLead: isDesktop });
  const alertSettings = useAlertSettings();
  const { view, navigate } = useNavigation({ onNavigate: leads.closeDetail });
  const { selectedLead } = leads;
  const signOut = useSignOut();
  // SignedInGate only shows the app once someone's signed in, so there's always a user here.
  const userName = useSession().data?.name ?? "";
  // On mobile the open detail panel covers everything else, so the rest of the page goes inert.
  const coveredByDetail = !isDesktop && leads.isDetailOpen;
  const viewLabel = NAV_ITEMS.find((item) => item.view === view)?.label;

  useEffect(() => {
    document.title = viewLabel ? `${viewLabel} – Kestlow` : "Kestlow";
  }, [viewLabel]);

  return (
    <div className="min-h-screen desk:grid desk:h-screen desk:grid-cols-[240px_minmax(380px,1fr)_minmax(360px,1.1fr)] desk:overflow-hidden">
      <a
        href="#main"
        inert={coveredByDetail}
        className="sr-only z-30 rounded-xl bg-card font-bold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-3"
      >
        Skip to main content
      </a>

      <Sidebar
        items={NAV_ITEMS}
        activeView={view}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
        onSignOut={() => signOut.mutate()}
        userName={userName}
      />

      <main
        id="main"
        tabIndex={-1}
        inert={coveredByDetail}
        className="mx-auto max-w-[520px] pb-[90px] desk:m-0 desk:max-w-none desk:overflow-y-auto desk:border-r desk:border-line desk:p-0"
      >
        <TopBar onToggleTheme={toggleTheme} onSignOut={() => signOut.mutate()} />
        <VerifyEmailBanner />
        {view === "leads" && <LeadsView leads={leads} cardsClickable={isDesktop} />}
        {view === "saved" && <SavedView leads={leads} cardsClickable={isDesktop} />}
        {view === "alerts" && <AlertsView settings={alertSettings} />}
        {view === "account" && <AccountView />}
      </main>

      <DetailPanel
        open={leads.isDetailOpen}
        focusKey={leads.isDetailOpen ? leads.openCount : null}
        onBack={leads.closeDetail}
      >
        {selectedLead ? (
          <LeadDetail
            lead={selectedLead}
            saved={leads.isSaved(selectedLead.id)}
            onToggleSave={leads.toggleSaved}
          />
        ) : (
          <p className="mt-20 hidden text-center text-muted desk:block">
            Select a lead to see its details.
          </p>
        )}
      </DetailPanel>

      <BottomNav
        items={NAV_ITEMS}
        activeView={view}
        onNavigate={navigate}
        inert={coveredByDetail}
      />
    </div>
  );
}
