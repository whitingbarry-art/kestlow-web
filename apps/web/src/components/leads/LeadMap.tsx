import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

interface LeadMapProps {
  /** WGS84 latitude and longitude of the application site. */
  location: { lat: number; lng: number };
  /** The site's address, for the screen-reader caption. */
  address: string;
}

const ZOOM = 16;
// The theme's navy and amber (index.css). SVG attributes can't read CSS variables.
const PIN = { color: "#12304a", fillColor: "#f5a623" };

// OpenStreetMap's tile usage policy: their URL, visible attribution, no bulk or offline use.
// Tests and Storybook's test runs skip tiles so they never call OpenStreetMap.
const TILE_URL =
  import.meta.env.MODE === "test" ? null : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/**
 * A fixed map with a pin on the application site (KES-31). It doesn't pan or zoom, so there's
 * nothing to trap the keyboard or need a precise gesture; "Open a larger map" does that instead.
 */
export function LeadMap({ location, address }: LeadMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const pin = useRef<L.CircleMarker | null>(null);
  const { lat, lng } = location;
  // Where the map starts; the second effect moves it when the lead changes.
  const start = useRef(location);

  useEffect(() => {
    if (!container.current) return;
    const created = L.map(container.current, {
      center: [start.current.lat, start.current.lng],
      zoom: ZOOM,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false,
      zoomAnimation: false,
      fadeAnimation: false,
    });
    created.attributionControl.setPrefix(false);
    if (TILE_URL) L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(created);
    pin.current = L.circleMarker([start.current.lat, start.current.lng], {
      radius: 9,
      ...PIN,
      weight: 3,
      fillOpacity: 1,
      interactive: false,
    }).addTo(created);
    map.current = created;

    // The detail panel can change size (and slides in on mobile), so keep the tiles filling it.
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => created.invalidateSize({ animate: false }));
    resize?.observe(container.current);
    return () => {
      resize?.disconnect();
      created.remove();
      map.current = null;
      pin.current = null;
    };
  }, []);

  useEffect(() => {
    map.current?.setView([lat, lng], ZOOM, { animate: false });
    pin.current?.setLatLng([lat, lng]);
  }, [lat, lng]);

  const largerMap = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;

  return (
    <figure className="my-3.5">
      <figcaption className="sr-only">Map showing where {address} is.</figcaption>
      <div
        ref={container}
        className="h-48 overflow-hidden rounded-card bg-chip"
        data-chromatic="ignore"
      />
      <a
        href={largerMap}
        target="_blank"
        rel="noreferrer"
        className="mt-0.5 inline-block py-1 text-sm font-semibold text-ink underline"
      >
        Open a larger map <span className="sr-only">(opens in a new tab)</span>
      </a>
    </figure>
  );
}
