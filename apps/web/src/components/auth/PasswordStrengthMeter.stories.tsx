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

const rules = (long: boolean, notPersonal: boolean, hardToGuess: boolean) => ({
  long,
  notPersonal,
  hardToGuess,
});

export const Weak: Story = {
  args: {
    check: {
      strength: "weak",
      rules: rules(true, true, false),
      tip: "This is similar to a commonly used password.",
    },
  },
};

export const UsesTheirName: Story = {
  args: {
    check: {
      strength: "weak",
      rules: rules(true, false, false),
      tip: "Leave out your email address.",
    },
  },
};

export const Good: Story = {
  args: {
    check: {
      strength: "good",
      rules: rules(true, true, true),
      tip: "That will do. Another word would make it Strong.",
    },
  },
};

export const Strong: Story = {
  args: { check: { strength: "strong", rules: rules(true, true, true), tip: null } },
};
