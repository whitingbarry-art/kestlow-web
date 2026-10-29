import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSampleAuthApi, SAMPLE_USER } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { providers } from "../../test/providers";
import { VerifyEmailBanner } from "./VerifyEmailBanner";

const renderBanner = (emailVerified: boolean) => {
  const authApi = createSampleAuthApi({ ...SAMPLE_USER, emailVerified });
  render(<VerifyEmailBanner />, { wrapper: providers(createSampleLeadsApi(), authApi) });
  return authApi;
};

describe("VerifyEmailBanner", () => {
  it("asks someone who hasn't confirmed their email to do it, and sends the link again", async () => {
    const user = userEvent.setup();
    const authApi = renderBanner(false);
    const resend = vi.spyOn(authApi, "resendVerification");

    expect(await screen.findByText(/We sent a link to dave@example.com/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Send the link again" }));

    expect(resend).toHaveBeenCalledWith("dave@example.com");
    expect(
      await screen.findByText("Sent. Check your inbox, and your spam folder too."),
    ).toBeVisible();
  });

  it("stays hidden once the email is confirmed", async () => {
    renderBanner(true);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText(/Please confirm your email/)).not.toBeInTheDocument();
  });
});
