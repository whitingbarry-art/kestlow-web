import type { Meta, StoryObj } from "@storybook/react-vite";
import { PLANS } from "../../data/waitlist";
import { PlanCard } from "./PlanCard";

const meta = {
  title: "Waitlist/PlanCard",
  component: PlanCard,
  args: { plan: PLANS[1] },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solo: Story = {};

export const Free: Story = { args: { plan: PLANS[0] } };

export const Pro: Story = { args: { plan: PLANS[2] } };
