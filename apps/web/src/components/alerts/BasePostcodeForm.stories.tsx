import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { BasePostcodeResult } from "../../api/leads";
import { Card } from "../ui/Card";
import { BasePostcodeForm } from "./BasePostcodeForm";

const meta = {
  title: "Alerts/BasePostcodeForm",
  component: BasePostcodeForm,
  args: {
    postcode: null,
    onSave: fn((postcode: string) =>
      Promise.resolve<BasePostcodeResult>({ ok: true, postcode: postcode.toUpperCase() }),
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Card>
          <Story />
        </Card>
      </div>
    ),
  ],
} satisfies Meta<typeof BasePostcodeForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotSet: Story = {};

export const Set: Story = { args: { postcode: "BR1 1AA" } };

export const NotFound: Story = {
  args: {
    postcode: "BR1 1AA",
    onSave: fn((postcode: string) =>
      Promise.resolve<BasePostcodeResult>({
        ok: false,
        message: `We can't find ${postcode.toUpperCase()}. Check it and try again.`,
      }),
    ),
  },
};
