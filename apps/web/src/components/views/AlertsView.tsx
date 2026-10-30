import type { ReactNode } from "react";
import type { AlertSettingsState } from "../../hooks/useAlertSettings";
import { AreaMap } from "../alerts/AreaMap";
import { BasePostcodeForm } from "../alerts/BasePostcodeForm";
import { DistanceSlider } from "../alerts/DistanceSlider";
import { SettingRow } from "../alerts/SettingRow";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ErrorState } from "../ui/ErrorState";
import { LoadingState } from "../ui/LoadingState";
import { PageHeader } from "../ui/PageHeader";
import { SectionTitle } from "../ui/SectionTitle";

interface AlertsViewProps {
  settings: AlertSettingsState;
}

export function AlertsView({ settings }: AlertsViewProps) {
  const { settingsStatus } = settings;
  return (
    <section>
      <PageHeader title="Alerts" subtitle="Choose how and when you hear about new leads" />
      {settingsStatus.isError ? (
        <ErrorState
          message="Your alert settings couldn't be loaded."
          onRetry={settingsStatus.retry}
        />
      ) : settingsStatus.isPending || !settings.base ? (
        // Nothing to toggle until the saved settings are in, so nothing changes under a finger.
        <LoadingState message="Loading your alert settings…" />
      ) : (
        <AlertSettingsForm settings={settings} base={settings.base} />
      )}
    </section>
  );
}

function AlertSettingsForm({
  settings,
  base,
}: AlertsViewProps & { base: NonNullable<AlertSettingsState["base"]> }) {
  return (
    <>
      <SectionTitle>Delivery</SectionTitle>
      <Card>
        {settings.deliveryOptions.map((option) => (
          <SettingRow
            key={option.key}
            label={option.label}
            description={option.description}
            checked={settings.delivery[option.key]}
            onToggle={() => settings.toggleDelivery(option.key)}
          />
        ))}
        {settings.pushOffHere && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5">
            <p className="m-0 text-sm">
              Push alerts are on for your account, but not on this device.
            </p>
            <Button variant="ghost" className="flex-none" onClick={settings.turnOnPushHere}>
              Turn on for this device
            </Button>
          </div>
        )}
        {/* Always there, so screen readers announce a problem when one appears. */}
        <p
          role="status"
          className={cn(
            "m-0 text-sm",
            settings.pushProblemIsHelp
              ? "mb-3.5 rounded-xl bg-chip p-3 text-ink"
              : "font-semibold text-error",
            settings.pushProblem && !settings.pushProblemIsHelp && "pb-3.5",
          )}
        >
          {settings.pushProblem}
        </p>
      </Card>

      <SectionTitle>My trades</SectionTitle>
      <Card>
        {settings.tradeOptions.map((trade) => (
          <SettingRow
            key={trade}
            label={trade}
            description={settings.tradeNotes[trade]}
            checked={settings.trades[trade]}
            onToggle={() => settings.toggleTrade(trade)}
          />
        ))}
        {settings.limits.maxTrades < settings.tradeOptions.length && (
          <PlanNote>
            Your plan covers your main trade, the first you chose. Any others you switch on are
            kept, and start straight away with Pro.
          </PlanNote>
        )}
      </Card>

      <SectionTitle>Area</SectionTitle>
      <Card>
        <BasePostcodeForm postcode={settings.basePostcode} onSave={settings.saveBasePostcode} />
        <DistanceSlider
          value={settings.distance}
          min={settings.distanceMin}
          max={settings.distanceMax}
          label={settings.distanceLabel}
          onChange={settings.setDistance}
        />
        <AreaMap
          base={base}
          radiusMiles={settings.distanceCovered}
          postcode={settings.basePostcode}
        />
        {settings.plan !== "pro" && (
          <PlanNote>
            Your plan covers up to {settings.limits.maxRadiusMiles} miles
            {settings.distance > settings.distanceCovered
              ? `, so leads come from within ${settings.distanceCovered}. The full ${settings.distance} miles start straight away with Pro.`
              : ". Pro goes up to 50."}
          </PlanNote>
        )}
      </Card>
    </>
  );
}

/** What the plan limits here, with the way to a plan that doesn't (KES-52). */
function PlanNote({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mb-3.5 rounded-xl bg-chip p-3 text-sm text-ink">
      {children}{" "}
      <a href="/pricing" className="font-semibold text-ink underline">
        See plans
      </a>
    </p>
  );
}
