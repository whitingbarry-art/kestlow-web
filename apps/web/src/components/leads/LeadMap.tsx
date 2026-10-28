import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { addPin, createFixedMap, fillContainer } from "../maps/mapLayers";

interface LeadMapProps {
  /** WGS84 latitude and longitude of the application site. */
  location: { lat: number; lng: number };
  /** The site's address, for the screen-reader caption. */
  address: string;
}

const ZOOM = 16;

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
    const created = createFixedMap(container.current, [start.current.lat, start.current.lng], ZOOM);
    pin.current = addPin(created, [start.current.lat, start.current.lng]);
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
