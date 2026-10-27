import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthApi } from "../../api/auth";
import { createSampleAuthApi, SAMPLE_PASSWORD, SAMPLE_USER } from "../../api/sampleAuthApi";
import { useSignOut } from "../../hooks/useSession";
import { providers } from "../../test/providers";
import { SignedInGate } from "./SignedInGate";

function SignOutButton() {
  const signOut = useSignOut();
  return (
    <button type="button" onClick={() => signOut.mutate()}>
      Sign out
    </button>
  );
}

const renderGate = (authApi: AuthApi) =>
  render(
    <SignedInGate>
      <p>The app</p>
      <SignOutButton />
    </SignedInGate>,
    { wrapper: providers(undefined, authApi) },
  );

describe("SignedInGate", () => {
  it("shows the app to someone signed in", async () => {
    renderGate(createSampleAuthApi());

    expect(await screen.findByText("The app")).toBeInTheDocument();
  });

  it("shows the sign-in screen to everyone else", async () => {
    renderGate(createSampleAuthApi(null));

    expect(await screen.findByRole("heading", { name: "Sign in to Kestlow" })).toBeInTheDocument();
    expect(screen.queryByText("The app")).not.toBeInTheDocument();
  });

  it("lets them in once they sign in, and back out when they sign out", async () => {
    const user = userEvent.setup();
    renderGate(createSampleAuthApi(null));

    await user.type(await screen.findByLabelText("Email address"), SAMPLE_USER.email);
    await user.type(screen.getByLabelText("Password"), SAMPLE_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("The app")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("heading", { name: "Sign in to Kestlow" })).toBeInTheDocument();
  });

  it("offers a retry when it can't tell who's signed in", async () => {
    const user = userEvent.setup();
    const getMe = vi
      .fn<AuthApi["getMe"]>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(SAMPLE_USER);
    renderGate({ ...createSampleAuthApi(), getMe });

    await user.click(await screen.findByRole("button", { name: "Try again" }));

    expect(await screen.findByText("The app")).toBeInTheDocument();
  });
});
