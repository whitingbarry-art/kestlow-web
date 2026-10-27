import type { Meta, StoryObj } from "@storybook/react-vite";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

const meta = {
  title: "Auth/PasswordStrengthMeter",
  component: PasswordStrengthMeter,
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-card p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordStrengthMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { check: null } };

export const Weak: Story = {
  args: { check: { strength: "weak", tip: "This is similar to a commonly used password." } },
};

export const Medium: Story = {
  args: { check: { strength: "medium", tip: "Add more words that are less common." } },
};

export const Strong: Story = { args: { check: { strength: "strong", tip: null } } };
