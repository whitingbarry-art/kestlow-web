import type { Meta, StoryObj } from "@storybook/react-vite";
import { withLeadsApi } from "../../stories/withLeadsApi";
import { Card } from "../ui/Card";
import { apiOnPlan, PAYING, TRIALING } from "./billingStories";
import { PlanSummary } from "./PlanSummary";

const meta = {
  title: "Billing/PlanSummary",
  component: PlanSummary,
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Card>
          <Story />
        </Card>
      </div>
    ),
  ],
} satisfies Meta<typeof PlanSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Free: Story = { decorators: [withLeadsApi(apiOnPlan({ trialAvailable: false }))] };

export const Trial: Story = { decorators: [withLeadsApi(apiOnPlan(TRIALING))] };

export const FoundingMember: Story = { decorators: [withLeadsApi(apiOnPlan(PAYING))] };
