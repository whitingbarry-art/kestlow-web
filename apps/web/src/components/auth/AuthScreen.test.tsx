import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthApi } from "../../api/auth";
import { createSampleAuthApi } from "../../api/sampleAuthApi";
import { providers } from "../../test/providers";
import { AuthScreen } from "./AuthScreen";

const renderScreen = (authApi: AuthApi = createSampleAuthApi(null)) =>
  render(<AuthScreen />, { wrapper: providers(undefined, authApi) });

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

  it("registers with a name, email and password", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Your name"), "  Kim  ");
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    // The submit loads the password checker first, so the call comes a moment later.
    await vi.waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        name: "Kim",
        email: "kim@example.com",
        password: "ladder teapot rain",
      }),
    );
  });

  it("asks for a name before registering", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter your name.");
    expect(register).not.toHaveBeenCalled();
  });

  it("describes the password rules when registering", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "At least 8 characters, and it must reach Strong. Three random words, like ladder-teapot-rain, work well.",
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

  it("counts their own name as easy to guess", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Your name"), "Dave Roofer");
    await user.type(screen.getByLabelText("Password"), "daveroofer1");

    expect(await screen.findByText("Strength: Weak.")).toBeInTheDocument();
  });

  it("refuses a medium password, such as 8 random characters, without asking the API", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Your name"), "Kim");
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "hG7kq2Lm");
    expect(await screen.findByText("Strength: Medium.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText(/Not strong enough yet/)).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("refuses a weak password without asking the API", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    renderScreen(authApi);

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Your name"), "Kim");
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Not strong enough yet. Try three random words, like ladder-teapot-rain.",
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

  it("keeps an empty message area ready, so an error doesn't push the button down", () => {
    renderScreen();

    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
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
});
