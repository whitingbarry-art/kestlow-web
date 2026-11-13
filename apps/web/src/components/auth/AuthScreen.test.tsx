import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthApi } from "../../api/auth";
import { createSampleAuthApi } from "../../api/sampleAuthApi";
import { providers } from "../../test/providers";
import { AuthScreen } from "./AuthScreen";

const renderScreen = (authApi: AuthApi = createSampleAuthApi(null), recordStep = vi.fn()) =>
  render(<AuthScreen recordStep={recordStep} />, { wrapper: providers(undefined, authApi) });

describe("AuthScreen", () => {
  it("shows the API's message when sign-in fails", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText("Email address"), "dave@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That email and password don't match an account.",
    );
  });

  it("opens at Create your account from the launch page, and keeps where they came from", async () => {
    window.history.replaceState(null, "", "/?start=trial&ref=ad-trial");
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    expect(screen.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await user.type(screen.getByLabelText("Email address"), "dave@example.com");
    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await vi.waitFor(() =>
      expect(register).toHaveBeenCalledWith(expect.objectContaining({ source: "ad-trial" })),
    );
    await vi.waitFor(() => expect(window.location.search).toBe(""));
  });

  it("registers with just an email and password, no name (KES-169)", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    expect(screen.queryByLabelText("Your name")).toBeNull();
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    // The submit loads the password checker first, so the call comes a moment later.
    await vi.waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        email: "kim@example.com",
        password: "ladder teapot rain",
      }),
    );
  });

  it("describes the password rules when registering", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Use at least 8 characters that aren't easy to guess. Three random words, like ladder-teapot-rain, work well.",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
  });

  it.each([
    ["Password1!", "Strength: Weak."],
    ["ladder teapot rain", "Strength: Strong."],
  ])("rates %j as they type", async (password, rating) => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Password"), password);

    expect(await screen.findByText(rating)).toBeInTheDocument();
  });

  it("explains what makes a weak password weak", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Password"), "password123");

    expect(await screen.findByText("Strength: Weak.")).toBeInTheDocument();
    expect(screen.getByText(/commonly used password/)).toBeInTheDocument();
  });

  it("counts their own email as easy to guess", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Email address"), "daveroofer@example.com");
    await user.type(screen.getByLabelText("Password"), "daveroofer1");

    expect(await screen.findByText("Strength: Weak.")).toBeInTheDocument();
  });

  it("accepts a Good password, such as 8 random characters (KES-167)", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "hG7kq2Lm");
    expect(await screen.findByText("Strength: Good.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(register).toHaveBeenCalledWith(expect.objectContaining({ password: "hG7kq2Lm" }));
  });

  it("ticks off each rule as it's met, with a dash for those not yet (KES-167)", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    const needs = screen.getByRole("list", { name: "Your password needs" });
    expect(
      within(needs)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Not yet: At least 8 characters",
      "Not yet: Doesn't use your email address",
      "Not yet: Not a common password, word or pattern",
    ]);

    await user.type(screen.getByLabelText("Email address"), "daveroofer@example.com");
    await user.type(screen.getByLabelText("Password"), "daveroofer");
    await screen.findByText("Strength: Weak.");
    expect(
      within(needs)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Done: At least 8 characters",
      "Not yet: Doesn't use your email address",
      "Not yet: Not a common password, word or pattern",
    ]);

    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    await screen.findByText("Strength: Strong.");
    expect(
      within(needs)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Done: At least 8 characters",
      "Done: Doesn't use your email address",
      "Done: Not a common password, word or pattern",
    ]);
  });

  it("sends a sign-up once, however many times the button is tapped (KES-167)", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    let finish: (result: { ok: true }) => void = () => undefined;
    const register = vi
      .spyOn(authApi, "register")
      .mockImplementation(() => new Promise((resolve) => (finish = resolve)));
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    const button = screen.getByRole("button", { name: "Create account" });
    await user.tripleClick(button);

    const working = await screen.findByRole("button", { name: "Creating your account…" });
    expect(working).toBeDisabled();
    await user.click(working);
    expect(register).toHaveBeenCalledTimes(1);
    finish({ ok: true });
  });

  it("refuses a weak password without asking the API", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That password is too easy to guess. Try three random words, like ladder-teapot-rain.",
    );
    expect(register).not.toHaveBeenCalled();
  });

  it("doesn't rate passwords when signing in", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText("Password"), "Password1!");

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.queryByText(/Strength:/)).not.toBeInTheDocument();
  });

  it("moves focus to the new heading when switching screens", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    expect(screen.getByRole("heading", { name: "Create your account" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("heading", { name: "Sign in to Kestlow" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Forgot your password?" }));
    expect(screen.getByRole("heading", { name: "Forgot your password?" })).toHaveFocus();
  });

  it("sends a reset link to someone who's forgotten their password", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const requestPasswordReset = vi.spyOn(authApi, "requestPasswordReset");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Forgot your password?" }));
    await user.type(screen.getByLabelText("Email address"), " dave@example.com ");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(requestPasswordReset).toHaveBeenCalledWith("dave@example.com");
    // The same words whether or not there's an account.
    expect(await screen.findByRole("status")).toHaveTextContent(
      "If there's a Kestlow account for dave@example.com, we've sent a link. It works for one hour.",
    );
  });

  it("keeps an empty message area ready, so an error doesn't push the button down", () => {
    renderScreen();

    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
  });

  it("hides the password again after trying to sign in", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/don't match/)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("doesn't take focus on first load", () => {
    renderScreen();

    expect(screen.getByRole("heading", { name: "Sign in to Kestlow" })).not.toHaveFocus();
  });

  it("explains when Kestlow can't be reached", async () => {
    const user = userEvent.setup();
    renderScreen({
      ...createSampleAuthApi(null),
      signIn: () => Promise.reject(new Error("offline")),
    });

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't reach Kestlow. Please try again in a minute.",
    );
  });

  it("counts the steps of a sign-up from an ad, and why it was refused (KES-130)", async () => {
    window.history.replaceState(null, "", "/?start=trial&ref=ad-free");
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    vi.spyOn(authApi, "register").mockResolvedValue({
      ok: false,
      message: "There's already an account with that email. Sign in instead.",
      code: "USER_ALREADY_EXISTS",
    });
    const recordStep = vi.fn();
    renderScreen(authApi, recordStep);

    expect(recordStep).toHaveBeenCalledWith("register_viewed", { source: "ad-free" });

    await user.type(screen.getByLabelText("Email address"), "dave@example.com");
    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await vi.waitFor(() =>
      expect(recordStep).toHaveBeenCalledWith("register_refused", {
        source: "ad-free",
        reason: "user-already-exists",
      }),
    );
    expect(recordStep.mock.calls.filter(([step]) => step === "register_tried")).toHaveLength(1);
    window.history.replaceState(null, "", "/");
  });
});
