export function MapPlaceholder() {
  return (
    <div
      className="map-grid relative my-3.5 h-40 rounded-card"
      role="img"
      aria-label="Sample map placeholder"
    >
      <span className="absolute top-1/2 left-1/2 size-[18px] -translate-1/2 rounded-full bg-amber shadow-[0_0_0_8px_rgba(245,166,35,0.3)]" />
    </div>
  );
}
