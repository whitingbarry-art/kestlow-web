import type { Meta, StoryObj } from "@storybook/react-vite";
import { createSampleAuthApi, SAMPLE_TOKEN, SAMPLE_USER } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { StoryProviders } from "../../stories/StoryProviders";
import { ResetPasswordScreen } from "./ResetPasswordScreen";
import { VerifyEmailBanner } from "./VerifyEmailBanner";
import { VerifyEmailScreen } from "./VerifyEmailScreen";

/** The pages emailed links open, and the reminder to confirm an email (KES-40, KES-41). */
const meta = {
  title: "Auth/Account emails",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <StoryProviders
        api={createSampleLeadsApi()}
        authApi={createSampleAuthApi({ ...SAMPLE_USER, emailVerified: false })}
      >
        <Story />
      </StoryProviders>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResetPassword: Story = { render: () => <ResetPasswordScreen token={SAMPLE_TOKEN} /> };

export const ResetLinkCutShort: Story = { render: () => <ResetPasswordScreen token={null} /> };

export const EmailConfirmed: Story = { render: () => <VerifyEmailScreen token={SAMPLE_TOKEN} /> };

export const ConfirmLinkUsed: Story = { render: () => <VerifyEmailScreen token="old" /> };

export const ConfirmReminder: Story = { render: () => <VerifyEmailBanner /> };
