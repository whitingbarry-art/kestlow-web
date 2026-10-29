import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { BasePostcodeResult } from "../../api/leads";
import { BasePostcodeForm } from "./BasePostcodeForm";

const renderForm = (
  postcode: string | null,
  onSave = vi.fn((value: string) =>
    Promise.resolve<BasePostcodeResult>({ ok: true, postcode: value.toUpperCase() }),
  ),
) => {
  render(<BasePostcodeForm postcode={postcode} onSave={onSave} />);
  return onSave;
};

describe("BasePostcodeForm", () => {
  it("says leads come from central Bromley until a postcode is set", () => {
    renderForm(null);

    expect(screen.getByLabelText("Base postcode")).toHaveValue("");
    expect(screen.getByLabelText("Base postcode")).toHaveAccessibleDescription(
      /Not set yet, so leads are measured from central Bromley\./,
    );
  });

  it("starts from the saved postcode", () => {
    renderForm("BR1 1AA");

    expect(screen.getByLabelText("Base postcode")).toHaveValue("BR1 1AA");
  });

  it("saves the postcode and says where leads are measured from", async () => {
    const user = userEvent.setup();
    const onSave = renderForm(null);

    await user.type(screen.getByLabelText("Base postcode"), "se9 1aa");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith("se9 1aa");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Saved. Leads are now measured from SE9 1AA.",
    );
    expect(screen.getByLabelText("Base postcode")).toHaveValue("SE9 1AA");
  });

  it("shows the API's message for a postcode it can't find, and marks the box", async () => {
    const user = userEvent.setup();
    renderForm(
      "BR1 1AA",
      vi.fn(() =>
        Promise.resolve<BasePostcodeResult>({
          ok: false,
          message: "We can't find ZZ9 9ZZ. Check it and try again.",
        }),
      ),
    );

    await user.clear(screen.getByLabelText("Base postcode"));
    await user.type(screen.getByLabelText("Base postcode"), "ZZ9 9ZZ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("We can't find ZZ9 9ZZ. Check it and try again.")).toBeVisible();
    expect(screen.getByLabelText("Base postcode")).toHaveAttribute("aria-invalid", "true");
  });

  it("asks for a postcode rather than sending an empty one", async () => {
    const user = userEvent.setup();
    const onSave = renderForm(null);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("status")).toHaveTextContent("Enter your postcode.");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("explains when Kestlow can't be reached", async () => {
    const user = userEvent.setup();
    renderForm(
      null,
      vi.fn(() => Promise.reject(new Error("Network error"))),
    );

    await user.type(screen.getByLabelText("Base postcode"), "BR1 1AA");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("We couldn't reach Kestlow. Please try again in a minute."),
    ).toBeVisible();
  });
});
