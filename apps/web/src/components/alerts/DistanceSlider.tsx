interface DistanceSliderProps {
  value: number;
  min: number;
  max: number;
  label: string;
  basePostcode: string;
  onChange: (miles: number) => void;
}

export function DistanceSlider({ value, min, max, label, basePostcode, onChange }: DistanceSliderProps) {
  return (
    <div className="py-3.5">
      <div className="flex items-start justify-between gap-2">
        <b>Distance from base</b>
        <b>{label}</b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label="Distance in miles"
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-amber"
      />
      <small className="text-muted">Base postcode: {basePostcode}</small>
    </div>
  );
}
