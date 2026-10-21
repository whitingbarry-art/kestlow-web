import { Switch } from "../ui/Switch";

interface SettingRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}

export function SettingRow({ label, description, checked, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3.5 last:border-b-0">
      <div>
        <b className="block text-[15px]">{label}</b>
        {description && <small className="text-[13px] text-muted">{description}</small>}
      </div>
      <Switch checked={checked} label={label} onToggle={onToggle} />
    </div>
  );
}
