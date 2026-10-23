# Accessibility

Kestlow has to work for everyone, including people who use a screen reader, a keyboard only,
magnification, high zoom, voice control or switch access, and people with colour blindness,
motor impairments, cognitive or vestibular conditions. The minimum standard is
[WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/). A feature isn't done until it meets it.

## What runs automatically

- **ESLint** (`eslint-plugin-jsx-a11y`, in `@repo/eslint-config`) catches markup mistakes as you type.
- **Storybook + axe** (`@storybook/addon-a11y`): `npm run test-storybook` fails on any WCAG 2.2 AA
  or axe best-practice violation in any story. The Storybook workflow runs it on every pull request,
  and the Accessibility panel in Storybook shows the same results while you work.
- **Theme contrast** (`apps/web/src/styles/contrast.test.ts`) checks the colour tokens in both light
  and dark themes, because the axe run only renders the light theme.

Automated tools find roughly a third of real problems. The checklist below covers the rest.

## Checklist for every component or page

**Structure and screen readers**

- Use native elements first (`button`, `a`, `input`, `label`, `dl`, headings). Add ARIA only when
  no native element fits.
- Headings follow the page outline: one `h1` per view, `h2` for sections and list items.
- Every control has an accessible name that includes its visible text.
- Decorative icons and glyphs get `aria-hidden="true"`; meaningful images get a text alternative.
- State is exposed, not just shown: `aria-pressed`, `aria-checked`, `aria-current`, `aria-expanded`.
- Changes that happen away from the user's focus are announced, or focus moves to them.

**Keyboard**

- Everything works with Tab, Shift+Tab, Enter, Space and arrow keys where expected; nothing needs a mouse.
- Focus is always visible (the global `:focus-visible` ring). On `bg-side` surfaces add `[--focus:#fff]`.
- Panels and dialogs move focus in when they open, close on Escape, and return focus when they close.
- Content that is off-screen or covered is `inert`, so it can't be tabbed to or read out.

**Vision**

- Text contrast is at least 4.5:1, and controls, states and focus indicators at least 3:1, in both themes.
  Add new colour pairs to `contrast.test.ts`.
- Colour is never the only signal; pair it with text, an icon or a shape.
- Layout works at 400% zoom and 320px wide without horizontal page scrolling.
- Respect `prefers-color-scheme` and `prefers-reduced-motion` (handled globally; don't override them).

**Motor and cognitive**

- Touch targets are at least 24×24px, ideally 44×44px.
- Use plain language, keep labels consistent, and make errors say what went wrong and how to fix it.
- Never rely on time limits, hover-only content or precise gestures.

## Manual check before merging UI changes

1. Unplug the mouse: complete the flow with the keyboard alone.
2. Screen reader: run through it with NVDA (Windows), VoiceOver (macOS/iOS) or TalkBack (Android).
3. Zoom the browser to 200% and 400%, and try the mobile viewport.
4. Switch to the dark theme and turn on reduced motion in the OS.
