import type { Meta, StoryObj } from "@storybook/react-vite";
import { withLeadsApi } from "../../stories/withLeadsApi";
import { apiOnPlan, PAYING, TRIALING } from "./billingStories";
import { PricingPage } from "./PricingPage";

const meta = {
  title: "Billing/PricingPage",
  component: PricingPage,
  args: { goTo: () => {} },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PricingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new account that hasn't had its free trial. */
export const TrialOnOffer: Story = { decorators: [withLeadsApi(apiOnPlan({}))] };

export const DuringTrial: Story = { decorators: [withLeadsApi(apiOnPlan(TRIALING))] };

export const AlreadyPaying: Story = { decorators: [withLeadsApi(apiOnPlan(PAYING))] };
