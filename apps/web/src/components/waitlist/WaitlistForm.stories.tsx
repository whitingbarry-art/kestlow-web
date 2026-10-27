import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { JoinWaitlist } from "../../api/waitlist";
import { WaitlistForm } from "./WaitlistForm";

const meta = {
  title: "Waitlist/WaitlistForm",
  component: WaitlistForm,
  args: { join: fn<JoinWaitlist>(() => Promise.resolve({ ok: true })) },
  decorators: [
    (Story) => (
      <div className="max-w-2xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WaitlistForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AnswersToFix: Story = {
  args: {
    join: fn<JoinWaitlist>(() =>
      Promise.resolve({
        ok: false,
        errors: {
          email: "Enter a valid email address.",
          postcodeDistrict: "Enter a UK postcode, or its first half, like BR1.",
          trades: "Choose at least one trade.",
          currentSpend: "Choose what you spend on leads now.",
          wouldPay: "Choose what you'd pay.",
          plan: "Choose a plan, or Not sure yet.",
        },
      }),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Join the waitlist" }));
    await expect(canvas.getByRole("group", { name: "Some answers need fixing" })).toHaveFocus();
  },
};

export const Joined: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Join the waitlist" }));
    await expect(canvas.getByRole("heading", { name: "You're on the list" })).toHaveFocus();
  },
};

export const CouldNotJoin: Story = {
  args: { join: fn<JoinWaitlist>(() => Promise.reject(new Error("offline"))) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Join the waitlist" }));
    await expect(await canvas.findByRole("alert")).toBeVisible();
  },
};
