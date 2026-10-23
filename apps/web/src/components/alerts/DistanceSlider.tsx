import { useId } from "react";

interface DistanceSliderProps {
  value: number;
  min: number;
  max: number;
  label: string;
  basePostcode: string;
  onChange: (miles: number) => void;
}

export function DistanceSlider({
  value,
  min,
  max,
  label,
  basePostcode,
  onChange,
}: DistanceSliderProps) {
  const id = useId();

  return (
    <div className="py-3.5">
      <div className="flex items-start justify-between gap-2">
        <label htmlFor={`${id}-input`} className="font-bold">
          Distance from base
        </label>
        <b>{label}</b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        id={`${id}-input`}
        aria-valuetext={label}
        aria-describedby={`${id}-base`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-amber"
      />
      <small id={`${id}-base`} className="text-muted">
        Base postcode: {basePostcode}
      </small>
    </div>
  );
}
