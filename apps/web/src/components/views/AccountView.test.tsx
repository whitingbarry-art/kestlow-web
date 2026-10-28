import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "../../hooks/useSession";
import { createSampleAuthApi, SAMPLE_PASSWORD } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { providers } from "../../test/providers";
import { AccountView } from "./AccountView";

// Shows who's signed in alongside the page, so the tests can see a sign-out happen.
function Account() {
  const user = useSession().data;
  return (
    <>
      <p>{user ? `Signed in as ${user.name}` : "Signed out"}</p>
      <AccountView />
    </>
  );
}

const renderAccount = (authApi = createSampleAuthApi()) => {
  const user = userEvent.setup();
  render(<Account />, { wrapper: providers(createSampleLeadsApi(), authApi) });
  return { user, authApi };
};

describe("AccountView", () => {
  it("shows the signed-in person's name and email", async () => {
    renderAccount();

    expect(await screen.findByText("Dave Roofer")).toBeVisible();
    expect(screen.getByText("dave@example.com")).toBeVisible();
  });

  it("changes the password", async () => {
    const { user, authApi } = renderAccount();

    await user.type(await screen.findByLabelText("Current password"), SAMPLE_PASSWORD);
    await user.type(screen.getByLabelText("New password"), "ladder teapot rain umbrella");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      await screen.findByText("Password changed. You've been signed out on your other devices."),
    ).toBeVisible();
    expect(screen.getByLabelText("Current password")).toHaveValue("");
    await expect(
      authApi.signIn({ email: "dave@example.com", password: "ladder teapot rain umbrella" }),
    ).resolves.toEqual({ ok: true });
  });

  it("says so when the current password is wrong", async () => {
    const { user } = renderAccount();

    await user.type(await screen.findByLabelText("Current password"), "not my password");
    await user.type(screen.getByLabelText("New password"), "ladder teapot rain umbrella");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByText("That isn't your current password.")).toBeVisible();
  });

  it("refuses a weak new password without asking the API", async () => {
    const authApi = createSampleAuthApi();
    const changePassword = vi.spyOn(authApi, "changePassword");
    const { user } = renderAccount(authApi);

    await user.type(await screen.findByLabelText("Current password"), SAMPLE_PASSWORD);
    await user.type(screen.getByLabelText("New password"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      await screen.findByText(
        "Not strong enough yet. Try three random words, like ladder-teapot-rain.",
      ),
    ).toBeVisible();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("signs out of every device", async () => {
    const { user } = renderAccount();

    await user.click(await screen.findByRole("button", { name: "Sign out of all devices" }));

    expect(await screen.findByText("Signed out")).toBeVisible();
  });

  it("deletes the account only after a second step with the right password", async () => {
    const { user } = renderAccount();

    await user.click(await screen.findByRole("button", { name: "Delete my account…" }));
    const password = screen.getByLabelText("Enter your password to confirm");
    expect(password).toHaveFocus();

    await user.type(password, "not my password");
    await user.click(screen.getByRole("button", { name: "Delete my account" }));
    expect(await screen.findByText("That isn't your current password.")).toBeVisible();
    expect(screen.getByText("Signed in as Dave Roofer")).toBeVisible();

    await user.clear(password);
    await user.type(password, SAMPLE_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Delete my account" }));

    expect(await screen.findByText("Signed out")).toBeVisible();
  });

  it("can cancel deleting, putting focus back on the button", async () => {
    const { user } = renderAccount();

    await user.click(await screen.findByRole("button", { name: "Delete my account…" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByLabelText("Enter your password to confirm")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete my account…" })).toHaveFocus();
  });
});
