import { NAV_ITEMS } from "../data/navigation";
import { useAlertSettings } from "../hooks/useAlertSettings";
import { useLeads } from "../hooks/useLeads";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useNavigation } from "../hooks/useNavigation";
import { useTheme } from "../hooks/useTheme";
import { BottomNav } from "./layout/BottomNav";
import { DetailPanel } from "./layout/DetailPanel";
import { Sidebar } from "./layout/Sidebar";
import { TopBar } from "./layout/TopBar";
import { LeadDetail } from "./leads/LeadDetail";
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

  return (
    <div className="min-h-screen desk:grid desk:h-screen desk:grid-cols-[240px_minmax(380px,1fr)_minmax(360px,1.1fr)] desk:overflow-hidden">
      <Sidebar
        items={NAV_ITEMS}
        activeView={view}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto max-w-[520px] pb-[90px] desk:m-0 desk:max-w-none desk:overflow-y-auto desk:border-r desk:border-line desk:p-0">
        <TopBar onToggleTheme={toggleTheme} />
        {view === "leads" && <LeadsView leads={leads} cardsClickable={isDesktop} />}
        {view === "saved" && <SavedView leads={leads} cardsClickable={isDesktop} />}
        {view === "alerts" && <AlertsView settings={alertSettings} />}
      </main>

      <DetailPanel open={leads.isDetailOpen} onBack={leads.closeDetail}>
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

      <BottomNav items={NAV_ITEMS} activeView={view} onNavigate={navigate} />
    </div>
  );
}
