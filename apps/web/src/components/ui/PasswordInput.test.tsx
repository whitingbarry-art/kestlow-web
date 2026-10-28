import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./PasswordInput";

const renderInput = () =>
  render(
    <>
      <label htmlFor="pw">Password</label>
      <PasswordInput id="pw" />
    </>,
  );

describe("PasswordInput", () => {
  it("hides the password to start with", () => {
    renderInput();

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows and hides the password with the eye button", async () => {
    const user = userEvent.setup();
    renderInput();
    const toggle = screen.getByRole("button", { name: "Show password" });

    await user.click(toggle);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps what's typed when switching", async () => {
    const user = userEvent.setup();
    renderInput();

    await user.type(screen.getByLabelText("Password"), "ladder teapot rain");
    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(screen.getByLabelText("Password")).toHaveValue("ladder teapot rain");
  });
});
