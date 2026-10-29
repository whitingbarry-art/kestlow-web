import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { createSampleAuthApi } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { mobileViewport } from "../../stories/fixtures";
import { StoryProviders } from "../../stories/StoryProviders";
import { PRIVACY, REFUNDS, TERMS } from "../../data/legal";
import { AboutPage } from "./AboutPage";
import { ContactPage } from "./ContactPage";
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

export const Privacy: Story = { render: () => <LegalPage document={PRIVACY} /> };

export const Terms: Story = { render: () => <LegalPage document={TERMS} /> };

export const Refunds: Story = { render: () => <LegalPage document={REFUNDS} /> };

export const TermsOnMobile: Story = {
  globals: mobileViewport,
  render: () => <LegalPage document={TERMS} />,
};
