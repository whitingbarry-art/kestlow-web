import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { createSampleAuthApi } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { mobileViewport } from "../../stories/fixtures";
import { StoryProviders } from "../../stories/StoryProviders";
import { AuthScreen } from "./AuthScreen";

const meta = {
  title: "Auth/AuthScreen",
  component: AuthScreen,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <StoryProviders api={createSampleLeadsApi()} authApi={createSampleAuthApi(null)}>
        <Story />
      </StoryProviders>
    ),
  ],
} satisfies Meta<typeof AuthScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {};

export const Register: Story = { args: { initialMode: "register" } };

export const ForgotPassword: Story = { args: { initialMode: "forgot" } };

export const WrongPassword: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Email address"), "dave@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "not the password");
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "That email and password don't match an account.",
    );
  },
};

export const Mobile: Story = { globals: mobileViewport };
