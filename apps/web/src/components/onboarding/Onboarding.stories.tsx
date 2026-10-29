import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { withLeadsApi } from "../../stories/withLeadsApi";
import { Onboarding } from "./Onboarding";

const meta = {
  title: "Onboarding/Onboarding",
  component: Onboarding,
  args: { onDone: fn() },
  decorators: [withLeadsApi()],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Step 1 of 3; Continue moves through the trades and distance with the sample API. */
export const FirstStep: Story = {};
