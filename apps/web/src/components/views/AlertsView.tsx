import type { AlertSettingsState } from "../../hooks/useAlertSettings";
import { DistanceSlider } from "../alerts/DistanceSlider";
import { SettingRow } from "../alerts/SettingRow";
import { Card } from "../ui/Card";
import { PageHeader } from "../ui/PageHeader";
import { SectionTitle } from "../ui/SectionTitle";

interface AlertsViewProps {
  settings: AlertSettingsState;
}

export function AlertsView({ settings }: AlertsViewProps) {
  return (
    <section>
      <PageHeader title="Alerts" subtitle="Choose how and when you hear about new leads" />

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
      </Card>

      <SectionTitle>My trades</SectionTitle>
      <Card>
        {settings.tradeOptions.map((trade) => (
          <SettingRow
            key={trade}
            label={trade}
            checked={settings.trades[trade]}
            onToggle={() => settings.toggleTrade(trade)}
          />
        ))}
      </Card>

      <SectionTitle>Area</SectionTitle>
      <Card>
        <DistanceSlider
          value={settings.distance}
          min={settings.distanceMin}
          max={settings.distanceMax}
          label={settings.distanceLabel}
          basePostcode={settings.basePostcode}
          onChange={settings.setDistance}
        />
      </Card>
    </section>
  );
}
