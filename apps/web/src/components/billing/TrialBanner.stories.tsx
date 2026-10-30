import type { Meta, StoryObj } from "@storybook/react-vite";
import { withLeadsApi } from "../../stories/withLeadsApi";
import { apiOnPlan, TRIALING } from "./billingStories";
import { TrialBanner } from "./TrialBanner";

const meta = {
  title: "Billing/TrialBanner",
  component: TrialBanner,
  decorators: [withLeadsApi(apiOnPlan(TRIALING))],
} satisfies Meta<typeof TrialBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NineDaysLeft: Story = {};
