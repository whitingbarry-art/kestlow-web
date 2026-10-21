export function formatDistance(miles: number): string {
  return `${miles} miles`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
