import L from "leaflet";

// The theme's navy and amber (index.css). SVG attributes can't read CSS variables.
export const NAVY = "#12304a";
export const AMBER = "#f5a623";

// OpenStreetMap's tile usage policy: their URL, visible attribution, no bulk or offline use.
// Tests and Storybook's test runs skip tiles so they never call OpenStreetMap.
const TILE_URL =
  import.meta.env.MODE === "test" ? null : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

// The blueprint grid from the navy brand surface, drawn as its own layer between the tiles (200)
// and the overlays (overlay pane, 400), so it never covers them or the attribution. Faint enough
// that street names stay readable; decoration only, so it ignores the pointer.
const GRID_PANE = "grid";
const GRID_LINE = "rgb(18 48 74 / 0.12)";
class BlueprintGrid extends L.GridLayer {
  createTile(): HTMLElement {
    const tile = document.createElement("div");
    tile.style.backgroundImage = `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`;
    tile.style.backgroundSize = "32px 32px";
    return tile;
  }
}

/**
 * A fixed map: it doesn't pan or zoom, so there's nothing to trap the keyboard or need a precise
 * gesture. Comes with OpenStreetMap's tiles, their attribution and the blueprint grid.
 */
export function createFixedMap(container: HTMLElement, center: L.LatLngExpression, zoom: number) {
  const map = L.map(container, {
    center,
    zoom,
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
  map.attributionControl.setPrefix(false);
  if (TILE_URL) L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);
  const gridPane = map.createPane(GRID_PANE);
  gridPane.style.zIndex = "250";
  gridPane.style.pointerEvents = "none";
  new BlueprintGrid({ pane: GRID_PANE }).addTo(map);
  return map;
}

/** The amber pin with a navy ring, for an application site or a base postcode. */
export function addPin(map: L.Map, at: L.LatLngExpression) {
  return L.circleMarker(at, {
    radius: 9,
    color: NAVY,
    fillColor: AMBER,
    weight: 3,
    fillOpacity: 1,
    interactive: false,
  }).addTo(map);
}

/** Keeps the tiles filling a container that changes size, such as a sliding panel. */
export function fillContainer(map: L.Map, container: HTMLElement) {
  if (typeof ResizeObserver === "undefined") return () => {};
  const resize = new ResizeObserver(() => map.invalidateSize({ animate: false }));
  resize.observe(container);
  return () => resize.disconnect();
}
