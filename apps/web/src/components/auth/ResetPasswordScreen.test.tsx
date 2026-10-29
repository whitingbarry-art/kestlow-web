import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSampleAuthApi, SAMPLE_TOKEN } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { providers } from "../../test/providers";
import { ResetPasswordScreen } from "./ResetPasswordScreen";

const renderReset = (token: string | null, authApi = createSampleAuthApi(null)) => {
  render(<ResetPasswordScreen token={token} />, {
    wrapper: providers(createSampleLeadsApi(), authApi),
  });
  return { user: userEvent.setup(), authApi };
};

describe("ResetPasswordScreen", () => {
  it("sets a new password from the emailed link, then offers to sign in", async () => {
    const { user, authApi } = renderReset(SAMPLE_TOKEN);

    await user.type(screen.getByLabelText("New password"), "ladder teapot rain umbrella");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(await screen.findByRole("heading", { name: "Password changed" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/");
    await expect(
      authApi.signIn({ email: "dave@example.com", password: "ladder teapot rain umbrella" }),
    ).resolves.toEqual({ ok: true });
  });

  it("says when the link has expired or been used, and offers a new one", async () => {
    const { user } = renderReset("old");

    await user.type(screen.getByLabelText("New password"), "ladder teapot rain umbrella");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(
      await screen.findByText("This link has expired or has already been used. Ask for a new one."),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Ask for a new link" })).toHaveAttribute(
      "href",
      "/?forgot",
    );
  });

  it("refuses a weak password without asking the API", async () => {
    const authApi = createSampleAuthApi(null);
    const resetPassword = vi.spyOn(authApi, "resetPassword");
    const { user } = renderReset(SAMPLE_TOKEN, authApi);

    await user.type(screen.getByLabelText("New password"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(
      await screen.findByText(
        "Not strong enough yet. Try three random words, like ladder-teapot-rain.",
      ),
    ).toBeVisible();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("explains a link that's been cut short", () => {
    renderReset(null);

    expect(
      screen.getByText("This link isn't complete. Try copying the whole link from the email."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Save new password" })).toBeDisabled();
  });
});
