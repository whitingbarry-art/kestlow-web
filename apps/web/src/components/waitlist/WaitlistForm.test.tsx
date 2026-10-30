import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JoinWaitlist } from "../../api/waitlist";
import { WaitlistForm } from "./WaitlistForm";

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email address"), "dave@example.com");
  await user.type(screen.getByLabelText("Postcode you work from"), "br1 3ab");
  await user.click(screen.getByLabelText("Roofing"));
  await user.click(screen.getByLabelText("Groundworks"));
  await user.click(screen.getByLabelText("£50 to £150 a month"));
  await user.click(screen.getByLabelText("£20 to £40 a month"));
  await user.click(screen.getByLabelText("Pro, £490 a year"));
}

describe("WaitlistForm", () => {
  it("sends every answer, then thanks them and moves focus to the thanks", async () => {
    const user = userEvent.setup();
    const join = vi.fn<JoinWaitlist>().mockResolvedValue({ ok: true });
    render(<WaitlistForm join={join} />);

    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    expect(join).toHaveBeenCalledWith({
      email: "dave@example.com",
      postcode: "br1 3ab",
      trades: ["Roofing", "Groundworks"],
      currentSpend: "50-150",
      wouldPay: "20-40",
      plan: "pro-yearly",
      website: "",
    });
    expect(screen.getByRole("heading", { name: "You're on the list" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Join the waitlist" })).not.toBeInTheDocument();
  });

  it("sends the shop code from a counter card's link, when there is one (KES-121)", async () => {
    const user = userEvent.setup();
    const join = vi.fn<JoinWaitlist>().mockResolvedValue({ ok: true });
    render(<WaitlistForm join={join} source="screwfix-bromley" />);

    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    expect(join).toHaveBeenCalledWith(expect.objectContaining({ source: "screwfix-bromley" }));
  });

  it("lists the answers to fix, in question order, linked to each question", async () => {
    const user = userEvent.setup();
    const join = vi.fn<JoinWaitlist>().mockResolvedValue({
      ok: false,
      errors: { plan: "Choose a plan, or Not sure yet.", email: "Enter a valid email address." },
    });
    render(<WaitlistForm join={join} />);

    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    const summary = screen.getByRole("group", { name: "Some answers need fixing" });
    expect(summary).toHaveFocus();
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Enter a valid email address.",
      "Choose a plan, or Not sure yet.",
    ]);
    expect(links[0]).toHaveAttribute("href", `#${screen.getByLabelText("Email address").id}`);
    expect(links[1]).toHaveAttribute("href", `#${screen.getByLabelText("Free").id}`);
  });

  it("marks each answer to fix and describes it with its message", async () => {
    const user = userEvent.setup();
    const join = vi.fn<JoinWaitlist>().mockResolvedValue({
      ok: false,
      errors: {
        postcode: "Enter a UK postcode, or its first half, like BR1.",
        trades: "Choose at least one trade.",
      },
    });
    render(<WaitlistForm join={join} />);

    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    const postcode = screen.getByLabelText("Postcode you work from");
    expect(postcode).toHaveAttribute("aria-invalid", "true");
    expect(postcode).toHaveAccessibleDescription(
      "The first half is enough, like BR1. We only keep the first half. Enter a UK postcode, or its first half, like BR1.",
    );
    expect(
      screen.getByRole("group", { name: "Which trades do you work in?" }),
    ).toHaveAccessibleDescription("Choose all that apply. Choose at least one trade.");
    expect(screen.getByLabelText("Email address")).not.toHaveAttribute("aria-invalid");
  });

  it("clears the summary once the answers are fixed", async () => {
    const user = userEvent.setup();
    const join = vi
      .fn<JoinWaitlist>()
      .mockResolvedValueOnce({ ok: false, errors: { email: "Enter a valid email address." } })
      .mockResolvedValueOnce({ ok: true });
    render(<WaitlistForm join={join} />);

    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));
    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    expect(screen.queryByText("Some answers need fixing")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "You're on the list" })).toBeInTheDocument();
  });

  it("asks them to try again when the API can't be reached, keeping their answers", async () => {
    const user = userEvent.setup();
    const join = vi.fn<JoinWaitlist>().mockRejectedValue(new Error("offline"));
    render(<WaitlistForm join={join} />);

    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't add you just now. Please try again in a minute.",
    );
    expect(screen.getByLabelText("Email address")).toHaveValue("dave@example.com");
  });

  it("disables the button while it's sending, so it can't be sent twice", async () => {
    const user = userEvent.setup();
    let finish: (value: { ok: true }) => void = () => {};
    const join = vi.fn<JoinWaitlist>(() => new Promise((resolve) => (finish = resolve)));
    render(<WaitlistForm join={join} />);

    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    expect(screen.getByRole("button", { name: "Joining…" })).toBeDisabled();
    finish({ ok: true });
    expect(await screen.findByRole("heading", { name: "You're on the list" })).toBeInTheDocument();
  });

  it("hides the spam trap from people and screen readers", () => {
    const { container } = render(<WaitlistForm join={vi.fn<JoinWaitlist>()} />);

    const trap = container.querySelector('input[name="website"]');
    expect(trap).toHaveAttribute("tabindex", "-1");
    expect(trap?.closest('[aria-hidden="true"]')).toHaveClass("hidden");
  });
});
