import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { createSampleAuthApi } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { mobileViewport } from "../../stories/fixtures";
import { StoryProviders } from "../../stories/StoryProviders";
import { PRIVACY, REFUNDS, TERMS } from "../../data/legal";
import { areaPageFor } from "../../data/areas";
import { SAMPLE_LEADS } from "../../data/leads";
import type { CouncilPreview } from "../../api/councilPreview";
import { ErrorBoundary } from "../ErrorBoundary";
import { AboutPage } from "./AboutPage";
import { AccessibilityPage } from "./AccessibilityPage";
import { AreaPage } from "./AreaPage";
import { AreasIndexPage } from "./AreasIndexPage";
import { ContactPage } from "./ContactPage";
import { LeadEmailsPage } from "./LeadEmailsPage";
import { LegalPage } from "./LegalPage";

// Both pages read who's signed in, to fill in the contact form; here nobody is.
const meta = {
  title: "Site/Pages",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <StoryProviders api={createSampleLeadsApi()} authApi={createSampleAuthApi(null)}>
        <Story />
      </StoryProviders>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const About: Story = { render: () => <AboutPage /> };

export const AboutOnMobile: Story = { globals: mobileViewport, render: () => <AboutPage /> };

export const Accessibility: Story = { render: () => <AccessibilityPage /> };

export const AccessibilityOnMobile: Story = {
  globals: mobileViewport,
  render: () => <AccessibilityPage />,
};

// A town and trade page (KES-136) with made-up numbers and the sample leads, as the free plan shows them.
const COUNCIL_PREVIEW: CouncilPreview = {
  council: "Bromley",
  days: 30,
  total: 103,
  byTrade: { Roofing: 56, Electrical: 95, Landscaping: 9, Groundworks: 35 },
  examples: {
    Roofing: SAMPLE_LEADS.slice(0, 3).map((lead) => ({ ...lead, masked: true })),
    Electrical: [],
    Landscaping: [],
    Groundworks: [],
  },
};
const areaPage = (
  <AreaPage
    {...areaPageFor("/roofing-leads/bromley")!}
    load={() => Promise.resolve(COUNCIL_PREVIEW)}
    recordStep={() => {}}
    leadEmailsApi={{ request: () => Promise.resolve({ ok: true, status: "sent" }) }}
  />
);

export const TownAndTrade: Story = {
  render: () => areaPage,
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(/could need a roofer\.$/)).toBeVisible();
  },
};

export const TownAndTradeOnMobile: Story = { globals: mobileViewport, render: () => areaPage };

export const TownsAndTrades: Story = { render: () => <AreasIndexPage /> };

export const TownsAndTradesOnMobile: Story = {
  globals: mobileViewport,
  render: () => <AreasIndexPage />,
};

export const Contact: Story = {
  render: () => <ContactPage send={() => Promise.resolve({ ok: true })} />,
};

export const ContactOnMobile: Story = {
  globals: mobileViewport,
  render: () => <ContactPage send={() => Promise.resolve({ ok: true })} />,
};

export const ContactNeedsFixing: Story = {
  render: () => (
    <ContactPage
      send={() =>
        Promise.resolve({
          ok: false,
          errors: { name: "Enter your name.", topic: "Choose what your message is about." },
        })
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Send message" }));
    await expect(await canvas.findByText("Some answers need fixing")).toBeVisible();
  },
};

export const ContactSent: Story = {
  render: () => <ContactPage send={() => Promise.resolve({ ok: true })} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText("Your name"), "Dave");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(
      await canvas.findByRole("heading", { name: "Thanks, your message is on its way" }),
    ).toBeVisible();
  },
};

// The pages the free weekly leads emails' links open (KES-137).
const leadEmails = (confirm: { ok: true; sent: boolean } | { ok: false }) => ({
  confirm: () => Promise.resolve(confirm),
  stop: () => Promise.resolve(),
});

export const FreeLeadsConfirmed: Story = {
  render: () => (
    <LeadEmailsPage action="confirm" token="t" api={leadEmails({ ok: true, sent: true })} />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(/This week's leads are in your inbox now/),
    ).toBeVisible();
  },
};

export const FreeLeadsConfirmedOnMobile: Story = {
  globals: mobileViewport,
  render: () => (
    <LeadEmailsPage action="confirm" token="t" api={leadEmails({ ok: true, sent: true })} />
  ),
};

export const FreeLeadsLinkExpired: Story = {
  render: () => <LeadEmailsPage action="confirm" token="t" api={leadEmails({ ok: false })} />,
};

export const FreeLeadsStopped: Story = {
  render: () => <LeadEmailsPage action="stop" token="t" api={leadEmails({ ok: false })} />,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(/you won't get any more emails from us/),
    ).toBeVisible();
  },
};

export const Privacy: Story = { render: () => <LegalPage document={PRIVACY} /> };

export const Terms: Story = { render: () => <LegalPage document={TERMS} /> };

export const Refunds: Story = { render: () => <LegalPage document={REFUNDS} /> };

export const TermsOnMobile: Story = {
  globals: mobileViewport,
  render: () => <LegalPage document={TERMS} />,
};

function Broken(): never {
  throw new Error("Story: a page that breaks");
}

/** What people see if a page breaks (KES-38). */
export const SomethingWentWrong: Story = {
  render: () => (
    <ErrorBoundary reporter={{ report: () => {} }}>
      <Broken />
    </ErrorBoundary>
  ),
};
