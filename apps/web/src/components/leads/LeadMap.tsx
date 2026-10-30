import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { addArea, addPin, createFixedMap, fillContainer } from "../maps/mapLayers";

interface LeadMapProps {
  /** WGS84 latitude and longitude of the application site. */
  location: { lat: number; lng: number };
  /** The site's address, for the screen-reader caption. */
  address: string;
  /** Only roughly where it is, on the free plan (KES-52): an area, zoomed out, not a pin. */
  rough?: boolean;
}

const ZOOM = 16;
const ROUGH_ZOOM = 13;

/**
 * A fixed map with a pin on the application site (KES-31). It doesn't pan or zoom, so there's
 * nothing to trap the keyboard or need a precise gesture; "Open a larger map" does that instead.
 */
export function LeadMap({ location, address, rough = false }: LeadMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const pin = useRef<L.CircleMarker | L.Circle | null>(null);
  const zoom = rough ? ROUGH_ZOOM : ZOOM;
  // How it's drawn is fixed when the map is made; a lead that changes plan remounts it.
  const startRough = useRef(rough);
  const { lat, lng } = location;
  // Where the map starts; the second effect moves it when the lead changes.
  const start = useRef(location);

  useEffect(() => {
    if (!container.current) return;
    const at: L.LatLngTuple = [start.current.lat, start.current.lng];
    const created = createFixedMap(container.current, at, startRough.current ? ROUGH_ZOOM : ZOOM);
    pin.current = startRough.current ? addArea(created, at) : addPin(created, at);
    map.current = created;

    // The detail panel can change size (and slides in on mobile), so keep the tiles filling it.
    const stopFilling = fillContainer(created, container.current);
    return () => {
      stopFilling();
      created.remove();
      map.current = null;
      pin.current = null;
    };
  }, []);

  useEffect(() => {
    map.current?.setView([lat, lng], zoom, { animate: false });
    pin.current?.setLatLng([lat, lng]);
  }, [lat, lng, zoom]);

  // The free plan's larger map shows the area, without a marker on any one spot.
  const largerMap = rough
    ? `https://www.openstreetmap.org/#map=${ROUGH_ZOOM}/${lat}/${lng}`
    : `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;

  return (
    <figure className="my-3.5">
      <figcaption className="sr-only">
        {rough
          ? `Map showing roughly where in ${address} it is.`
          : `Map showing where ${address} is.`}
      </figcaption>
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
