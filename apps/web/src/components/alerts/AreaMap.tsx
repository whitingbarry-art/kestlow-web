import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { AMBER, NAVY, addPin, createFixedMap, prefersReducedMotion } from "../maps/mapLayers";

interface AreaMapProps {
  /** Where leads are measured from, as WGS84 latitude and longitude. */
  base: { lat: number; lng: number };
  radiusMiles: number;
  /** The base postcode, or null while the default area is in use; for the caption. */
  postcode: string | null;
}

const METRES_PER_MILE = 1609.344;

/**
 * Zooms so the whole circle shows, gliding there unless the person prefers less motion. A map with
 * no size yet can't be fitted, so it waits.
 */
const PADDING = L.point(12, 12);

function fit(map: L.Map, area: L.Circle, animate: boolean) {
  const size = map.getSize();
  if (size.x > 0 && size.y > 0)
    map.fitBounds(area.getBounds(), { padding: PADDING, animate, duration: 0.3 });
}

/**
 * A slider moving quickly starts a new zoom before the last has finished, and Leaflet drops it.
 * So when a zoom ends, check the circle still fits exactly, and zoom again if it doesn't.
 */
function fitAfterZoom(map: L.Map, area: L.Circle, animate: boolean) {
  const wanted = map.getBoundsZoom(area.getBounds(), false, PADDING.multiplyBy(2));
  if (Math.abs(map.getZoom() - wanted) > 0.01) fit(map, area, animate);
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
    // Any zoom level, not just whole ones, so the map follows the slider smoothly instead of
    // jumping a whole level at a time; the circle keeps its size on screen.
    const animate = !prefersReducedMotion();
    const created = createFixedMap(container.current, [startBase.lat, startBase.lng], 10, {
      zoomSnap: 0,
      zoomAnimation: animate,
      fadeAnimation: animate,
    });
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
    created.on("zoomend", () => fitAfterZoom(created, circle, animate));
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            created.invalidateSize({ animate: false });
            fit(created, circle, false);
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
    fit(map.current, area.current, !prefersReducedMotion());
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
