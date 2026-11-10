import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LeadEmailsApi } from "../../api/leadEmails";
import { LeadEmailsForm } from "./LeadEmailsForm";

type Request = LeadEmailsApi["request"];

async function fillIn(user: ReturnType<typeof userEvent.setup>, postcode = "br1") {
  await user.selectOptions(screen.getByLabelText("Your trade"), "Electrical");
  await user.type(screen.getByLabelText("Your postcode"), postcode);
  await user.type(screen.getByLabelText("Your email"), "dave@example.com");
}

describe("LeadEmailsForm", () => {
  it("asks for the weekly leads with the page's ref, then says to check the inbox", async () => {
    const user = userEvent.setup();
    const request = vi.fn<Request>(() => Promise.resolve({ ok: true, status: "sent" }));
    render(<LeadEmailsForm api={{ request }} source="ad-first" />);

    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Send me this week's leads" }));

    expect(request).toHaveBeenCalledWith({
      trade: "Electrical",
      postcode: "br1",
      email: "dave@example.com",
      source: "ad-first",
      website: "",
    });
    expect(await screen.findByRole("heading", { name: "Check your inbox" })).toHaveFocus();
    expect(screen.getByText(/We've sent a link to/)).toHaveTextContent("dave@example.com");
  });

  it("says plainly when Kestlow doesn't cover the postcode yet, and lets them try another", async () => {
    const user = userEvent.setup();
    const request = vi.fn<Request>(() => Promise.resolve({ ok: true, status: "outside" }));
    render(<LeadEmailsForm api={{ request }} />);

    await fillIn(user, "m11ae");
    await user.click(screen.getByRole("button", { name: "Send me this week's leads" }));

    expect(await screen.findByRole("heading", { name: "We don't cover M1 1AE yet" })).toHaveFocus();
    expect(screen.getByText(/35 councils across London and Kent/)).toHaveTextContent("Westminster");
    await user.click(screen.getByRole("button", { name: "Try another postcode" }));
    expect(screen.getByLabelText("Your postcode")).toBeInTheDocument();
  });

  it("starts with the trade chosen on a trade's own page", () => {
    render(<LeadEmailsForm api={{ request: vi.fn() }} trade="Landscaping" />);

    expect(screen.getByLabelText("Your trade")).toHaveValue("Landscaping");
  });

  it("lists what needs fixing, linked to each field", async () => {
    const user = userEvent.setup();
    const request = vi.fn<Request>(() =>
      Promise.resolve({
        ok: false,
        errors: {
          trade: "Choose your trade.",
          postcode: "We couldn't find that postcode. Please check it.",
        },
      }),
    );
    render(<LeadEmailsForm api={{ request }} />);

    await user.click(screen.getByRole("button", { name: "Send me this week's leads" }));

    expect(await screen.findByRole("group", { name: "Some answers need fixing" })).toHaveFocus();
    expect(
      screen.getByRole("link", { name: "We couldn't find that postcode. Please check it." }),
    ).toHaveAttribute("href", `#${screen.getByLabelText("Your postcode").id}`);
    expect(screen.getByLabelText("Your postcode")).toHaveAccessibleDescription(
      "Or just the first half, like BR1 We couldn't find that postcode. Please check it.",
    );
    expect(screen.getByLabelText("Your trade")).toBeInvalid();
    expect(screen.getByLabelText("Your email")).toBeValid();
  });

  it("offers the support address when it can't be sent", async () => {
    const user = userEvent.setup();
    render(<LeadEmailsForm api={{ request: () => Promise.reject(new Error("502")) }} />);

    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Send me this week's leads" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("support@kestlow.co.uk");
    expect(screen.getByLabelText("Your email")).toHaveValue("dave@example.com");
  });

  it("says what they're signing up to, with the privacy notice", () => {
    render(<LeadEmailsForm api={{ request: vi.fn() }} />);

    expect(screen.getByText(/one email a week, and you can stop any time/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "privacy notice" })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});
