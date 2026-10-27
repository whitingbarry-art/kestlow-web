import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { JoinWaitlist } from "../../api/waitlist";
import { WaitlistPage } from "./WaitlistPage";

const meta = {
  title: "Waitlist/WaitlistPage",
  component: WaitlistPage,
  args: { join: fn<JoinWaitlist>(() => Promise.resolve({ ok: true })) },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WaitlistPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { globals: { viewport: { value: "desktop" } } };

export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
