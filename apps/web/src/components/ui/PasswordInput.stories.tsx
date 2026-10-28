import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { PasswordInput } from "./PasswordInput";

const meta = {
  title: "UI/PasswordInput",
  component: PasswordInput,
  args: { id: "password", defaultValue: "ladder teapot rain" },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-card p-4">
        <label htmlFor="password" className="block font-bold">
          Password
        </label>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {};

export const Shown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show password" }));
    await expect(canvas.getByLabelText("Password")).toHaveAttribute("type", "text");
  },
};
