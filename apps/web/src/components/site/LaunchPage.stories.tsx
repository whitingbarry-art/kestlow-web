import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SAMPLE_LEADS } from "../../data/leads";
import { LaunchPage } from "./LaunchPage";

const meta = {
  title: "Site/LaunchPage",
  component: LaunchPage,
  args: {
    source: "screwfix-bromley",
    recordStep: fn(),
    // Sample numbers and leads, shown the way the free plan shows them.
    loadPreview: () =>
      Promise.resolve({
        radiusMiles: 15,
        days: 30,
        total: 305,
        byTrade: { Roofing: 133, Electrical: 277, Landscaping: 33, Groundworks: 102 },
        examples: SAMPLE_LEADS.slice(0, 4).map((lead) => ({ ...lead, masked: true })),
      }),
    leadEmailsApi: { request: () => Promise.resolve({ ok: true, status: "sent" }) },
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LaunchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { globals: { viewport: { value: "desktop" } } };

export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** The free weekly leads form after asking (KES-137). */
export const FreeLeadsSent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("Your trade"), "Roofing");
    await userEvent.type(canvas.getByLabelText("Your postcode"), "BR1");
    await userEvent.type(canvas.getByLabelText("Your email"), "dave@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Send me this week's leads" }));
    await expect(await canvas.findByRole("heading", { name: "Check your inbox" })).toBeVisible();
  },
};

/** Somewhere Kestlow doesn't cover yet (KES-137). */
export const FreeLeadsOutsideTheArea: Story = {
  args: { leadEmailsApi: { request: () => Promise.resolve({ ok: true, status: "outside" }) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("Your trade"), "Electrical");
    await userEvent.type(canvas.getByLabelText("Your postcode"), "M1");
    await userEvent.type(canvas.getByLabelText("Your email"), "dave@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Send me this week's leads" }));
    await expect(
      await canvas.findByRole("heading", { name: "We don't cover M1 yet" }),
    ).toBeVisible();
  },
};
