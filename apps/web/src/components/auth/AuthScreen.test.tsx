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
    await user.type(screen.getByLabelText("Password"), "a long enough password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(register).toHaveBeenCalledWith({
      name: "Kim",
      email: "kim@example.com",
      password: "a long enough password",
    });
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
      "At least 8 characters. A few words together is easy to remember.",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
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
