import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { AMBER, NAVY, addPin, createFixedMap } from "../maps/mapLayers";

interface AreaMapProps {
  /** Where leads are measured from, as WGS84 latitude and longitude. */
  base: { lat: number; lng: number };
  radiusMiles: number;
  /** The base postcode, or null while the default area is in use; for the caption. */
  postcode: string | null;
}

const METRES_PER_MILE = 1609.344;

/** Zooms so the whole circle shows. A map with no size yet can't be fitted, so it waits. */
function fit(map: L.Map, area: L.Circle) {
  const size = map.getSize();
  if (size.x > 0 && size.y > 0)
    map.fitBounds(area.getBounds(), { padding: [12, 12], animate: false });
}

/**
 * The area leads come from: the base pinned, with the distance shaded around it (KES-25). It
 * follows the slider as it moves, zooming so the whole circle fits. Fixed, like the lead map.
 */
export function AreaMap({ base, radiusMiles, postcode }: AreaMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const area = useRef<L.Circle | null>(null);
  const pin = useRef<L.CircleMarker | null>(null);
  const { lat, lng } = base;
  // Where the map starts; the second effect follows changes.
  const start = useRef({ base, radiusMiles });

  useEffect(() => {
    if (!container.current) return;
    const { base: startBase, radiusMiles: startMiles } = start.current;
    const created = createFixedMap(container.current, [startBase.lat, startBase.lng], 10);
    area.current = L.circle([startBase.lat, startBase.lng], {
      radius: startMiles * METRES_PER_MILE,
      color: NAVY,
      weight: 2,
      fillColor: AMBER,
      fillOpacity: 0.18,
      interactive: false,
    }).addTo(created);
    pin.current = addPin(created, [startBase.lat, startBase.lng]);
    map.current = created;

    // Fit again whenever the map changes size, including when it first gets one.
    const circle = area.current;
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            created.invalidateSize({ animate: false });
            fit(created, circle);
          });
    resize?.observe(container.current);
    return () => {
      resize?.disconnect();
      created.remove();
      map.current = null;
      area.current = null;
      pin.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !area.current) return;
    area.current.setLatLng([lat, lng]).setRadius(radiusMiles * METRES_PER_MILE);
    pin.current?.setLatLng([lat, lng]);
    fit(map.current, area.current);
  }, [lat, lng, radiusMiles]);

  const where = postcode ?? "central Bromley";
  return (
    <figure className="m-0 mb-3.5">
      <figcaption className="sr-only">
        Map of the area leads come from: {radiusMiles} miles around {where}.
      </figcaption>
      <div
        ref={container}
        className="h-56 overflow-hidden rounded-card bg-chip"
        data-chromatic="ignore"
      />
    </figure>
  );
}
