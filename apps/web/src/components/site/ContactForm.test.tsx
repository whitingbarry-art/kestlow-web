import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SendContact } from "../../api/contact";
import { ContactForm } from "./ContactForm";

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Your name"), "Dave");
  await user.type(screen.getByLabelText("Email address"), "dave@example.com");
  await user.selectOptions(screen.getByLabelText("What's it about?"), "Feedback or an idea");
  await user.type(screen.getByLabelText("Your message"), "Could it cover Dartford?");
}

describe("ContactForm", () => {
  it("sends the message and says thanks", async () => {
    const user = userEvent.setup();
    const send = vi.fn<SendContact>(() => Promise.resolve({ ok: true }));
    render(<ContactForm send={send} />);

    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(send).toHaveBeenCalledWith({
      name: "Dave",
      email: "dave@example.com",
      topic: "feedback",
      message: "Could it cover Dartford?",
      website: "",
    });
    expect(
      await screen.findByRole("heading", { name: "Thanks, your message is on its way" }),
    ).toHaveFocus();
  });

  it("lists what needs fixing, linked to each field", async () => {
    const user = userEvent.setup();
    const send = vi.fn<SendContact>(() =>
      Promise.resolve({
        ok: false,
        errors: { email: "Enter a valid email address.", message: "Write your message." },
      }),
    );
    render(<ContactForm send={send} />);

    await user.click(screen.getByRole("button", { name: "Send message" }));

    const summary = await screen.findByRole("group", { name: "Some answers need fixing" });
    expect(summary).toHaveFocus();
    expect(screen.getByRole("link", { name: "Enter a valid email address." })).toHaveAttribute(
      "href",
      `#${screen.getByLabelText("Email address").id}`,
    );
    expect(screen.getByLabelText("Email address")).toHaveAccessibleDescription(
      "Enter a valid email address.",
    );
    expect(screen.getByLabelText("Your message")).toBeInvalid();
    expect(screen.getByLabelText("Your name")).toBeValid();
  });

  it("offers the email address when sending fails", async () => {
    const user = userEvent.setup();
    const send = vi.fn<SendContact>(() => Promise.reject(new Error("502")));
    render(<ContactForm send={send} />);

    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your message couldn't be sent just now. Please try again in a minute, or email support@kestlow.co.uk.",
    );
    expect(screen.getByLabelText("Your message")).toHaveValue("Could it cover Dartford?");
  });

  it("fills in the name and email of someone signed in", () => {
    render(<ContactForm send={vi.fn()} name="Dave Smith" email="dave@example.com" />);

    expect(screen.getByLabelText("Your name")).toHaveValue("Dave Smith");
    expect(screen.getByLabelText("Email address")).toHaveValue("dave@example.com");
  });

  it("hides the spam trap from people and screen readers", () => {
    render(<ContactForm send={vi.fn()} />);

    expect(screen.queryByRole("textbox", { name: "Website" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("textbox").map((box) => box.getAttribute("name"))).toEqual([
      "name",
      "email",
      "message",
    ]);
  });
});
