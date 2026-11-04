import { render, screen } from "@testing-library/react";
import type { LeadEmailsApi } from "../../api/leadEmails";
import { LeadEmailsPage } from "./LeadEmailsPage";

const api = (overrides: Partial<Pick<LeadEmailsApi, "confirm" | "stop">> = {}) => ({
  confirm: vi.fn<LeadEmailsApi["confirm"]>(() => Promise.resolve({ ok: true, sent: true })),
  stop: vi.fn<LeadEmailsApi["stop"]>(() => Promise.resolve()),
  ...overrides,
});

describe("LeadEmailsPage", () => {
  it("confirms once from the link, says the first leads are in the inbox, and offers Pro", async () => {
    const fake = api();
    render(<LeadEmailsPage action="confirm" token="t0k3n" api={fake} />);

    expect(await screen.findByText(/This week's leads are in your inbox now/)).toBeInTheDocument();
    expect(fake.confirm).toHaveBeenCalledTimes(1);
    expect(fake.confirm).toHaveBeenCalledWith("t0k3n");
    expect(screen.getByRole("link", { name: "Start your free 14-day trial" })).toHaveAttribute(
      "href",
      "/?start=trial&ref=leads-email",
    );
  });

  it("says when nothing went straight away, as when the link is opened again", async () => {
    render(
      <LeadEmailsPage
        action="confirm"
        token="t0k3n"
        api={api({ confirm: () => Promise.resolve({ ok: true, sent: false }) })}
      />,
    );

    expect(await screen.findByText(/You're all set/)).toBeInTheDocument();
  });

  it("says when a link has expired, or has no token, and how to ask again", async () => {
    const { unmount } = render(
      <LeadEmailsPage
        action="confirm"
        token="old"
        api={api({ confirm: () => Promise.resolve({ ok: false }) })}
      />,
    );
    expect(await screen.findByText(/That link has stopped working/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ask for your leads again" })).toHaveAttribute(
      "href",
      "/#free-leads",
    );
    unmount();

    const fake = api();
    render(<LeadEmailsPage action="stop" token={null} api={fake} />);
    expect(await screen.findByText(/That link has stopped working/)).toBeInTheDocument();
    expect(fake.stop).not.toHaveBeenCalled();
  });

  it("stops the emails and says the details are deleted", async () => {
    const fake = api();
    render(<LeadEmailsPage action="stop" token="t0k3n" api={fake} />);

    expect(await screen.findByText(/you won't get any more emails from us/)).toBeInTheDocument();
    expect(fake.stop).toHaveBeenCalledWith("t0k3n");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Stop your weekly leads");
  });

  it("asks them to try again when something breaks", async () => {
    render(
      <LeadEmailsPage
        action="stop"
        token="t0k3n"
        api={api({ stop: () => Promise.reject(new Error("500")) })}
      />,
    );

    expect(await screen.findByText(/Please open the link again in a minute/)).toBeInTheDocument();
  });
});
