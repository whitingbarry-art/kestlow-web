import { readFileSync } from "node:fs";
import path from "node:path";

// Storybook's axe run only sees the light theme, so check every text and control colour pair in both themes here.
const css = readFileSync(path.join(import.meta.dirname, "index.css"), "utf8");

function readTokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map(([, name, value]) => [name, value]),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const light = readTokens(":root");
const dark = { ...light, ...readTokens('[data-theme="dark"]') };
const themes: Record<string, Record<string, string>> = {
  light: { ...light, white: "#ffffff" },
  dark: { ...dark, white: "#ffffff" },
};

// WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for control boundaries, states and focus indicators.
const TEXT_PAIRS = [
  ["ink", "page"],
  ["ink", "card"],
  ["ink", "chip"],
  ["muted", "page"],
  ["muted", "card"],
  ["muted", "chip"],
  ["new-text", "new-bg"],
  ["match-text", "match-bg"],
  ["error", "page"],
  ["error", "card"],
] as const;

const NON_TEXT_PAIRS = [
  ["selected", "page"],
  ["selected", "card"],
  ["switch-off", "card"],
  ["switch-off", "white"], // switch thumb
  ["muted", "card"], // text input border
  ["error", "card"], // border of an input that needs fixing
  ["white", "side"], // focus ring on navy surfaces
  ["ink", "page"], // focus ring
  ["ink", "card"],
] as const;

describe.each(Object.entries(themes))("%s theme contrast", (_, tokens) => {
  it.each(TEXT_PAIRS)("%s text on %s meets 4.5:1", (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NON_TEXT_PAIRS)("%s on %s meets 3:1", (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });
});

it("draws the focus ring in the ink colour", () => {
  expect(css).toMatch(/--focus:\s*var\(--ink\);/);
});

// The brand surface is decoration over --side: its lightest point is the amber glow over
// --side-light with a grid line on top, so text must pass there as well as on plain --side.
function blend(top: string, alpha: number, bottom: string): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  return `#${[1, 3, 5]
    .map((i) => Math.round(channel(top, i) * alpha + channel(bottom, i) * (1 - alpha)))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

const sideLink = /--color-side-link:\s*(#[0-9a-f]{6});/i.exec(css)?.[1] ?? "";
const amber = /--color-amber:\s*(#[0-9a-f]{6});/i.exec(css)?.[1] ?? "";

describe.each(Object.entries(themes))("%s theme brand surface", (_, tokens) => {
  const lightest = blend("#ffffff", 0.045, blend(amber, 0.14, tokens["side-light"]));
  // The sidebar's current page sits on a 14% white highlight.
  const highlighted = blend("#ffffff", 0.14, lightest);

  it.each([
    ["white", "#ffffff", lightest],
    ["side-link", sideLink, lightest],
    ["white on the current page's highlight", "#ffffff", highlighted],
  ])("%s text meets 4.5:1 at the lightest point", (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the white focus ring at 3:1", () => {
    expect(contrast("#ffffff", lightest)).toBeGreaterThanOrEqual(3);
  });
});
