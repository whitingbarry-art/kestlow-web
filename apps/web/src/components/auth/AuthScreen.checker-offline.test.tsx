import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSampleAuthApi } from "../../api/sampleAuthApi";
import { providers } from "../../test/providers";
import { AuthScreen } from "./AuthScreen";

// The password checker is a separate download; here it fails, as on a bad signal or after a
// deploy has replaced it.
vi.mock("../../logic/password", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("AuthScreen when the password checker can't load", () => {
  it("still registers, leaving the strength check to the API", async () => {
    const user = userEvent.setup();
    const authApi = createSampleAuthApi(null);
    const register = vi.spyOn(authApi, "register");
    render(<AuthScreen />, { wrapper: providers(undefined, authApi) });

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Your name"), "Kim");
    await user.type(screen.getByLabelText("Email address"), "kim@example.com");
    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await vi.waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        name: "Kim",
        email: "kim@example.com",
        password: "ladder teapot rain",
      }),
    );
  });
});
