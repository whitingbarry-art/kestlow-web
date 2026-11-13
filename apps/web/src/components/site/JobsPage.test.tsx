import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JobsNear, LoadJobs } from "../../api/jobs";
import { SAMPLE_LEADS } from "../../data/leads";
import type { Trade } from "../../types/lead";
import { JobsPage } from "./JobsPage";

const JOBS: JobsNear = {
  postcode: "BR1",
  trade: "Roofing",
  radiusMiles: 5,
  days: 30,
  total: 23,
  examples: [
    { ...SAMPLE_LEADS[0], id: "a", description: "Loft conversion with rear dormer", masked: true },
    { ...SAMPLE_LEADS[1], id: "b", description: "New roof and roof lights", masked: true },
    { ...SAMPLE_LEADS[2], id: "c", description: "Two storey side extension", masked: true },
  ],
};

const leadEmailsApi = { request: vi.fn() };

function renderPage(load: LoadJobs, recordStep = vi.fn(), trade?: Trade) {
  render(
    <JobsPage
      source="ad-jobs"
      trade={trade}
      load={load}
      recordStep={recordStep}
      leadEmailsApi={leadEmailsApi}
    />,
  );
  return { recordStep, user: userEvent.setup() };
}

async function lookUp(user: ReturnType<typeof userEvent.setup>, trade: string, postcode: string) {
  if (trade) await user.click(screen.getByRole("radio", { name: trade }));
  if (postcode) await user.type(screen.getByRole("textbox", { name: "Your postcode" }), postcode);
  await user.click(screen.getByRole("button", { name: "Show me the jobs" }));
}

describe("JobsPage (KES-155)", () => {
  it("shows how many jobs there are near them and three real ones, asking for nothing", async () => {
    const load = vi.fn<LoadJobs>(() => Promise.resolve({ ok: true, jobs: JOBS }));
    const { user } = renderPage(load);

    expect(screen.getByRole("heading", { level: 1, name: "Jobs near you" })).toBeVisible();
    await lookUp(user, "Roofing", "br1");

    expect(load).toHaveBeenCalledWith("br1", "Roofing");
    const answer = await screen.findByRole("heading", {
      level: 2,
      name: "23 roofing jobs within 5 miles of BR1",
    });
    expect(answer).toHaveFocus();
    expect(screen.getByText("In the last 30 days.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Here are 3 of them" })).toBeVisible();
    expect(screen.getByText("Loft conversion with rear dormer")).toBeVisible();
    expect(screen.getByText("Two storey side extension")).toBeVisible();
  });

  it("keeps the rest, and the address, for the trial, and offers the weekly email", async () => {
    const { user } = renderPage(() => Promise.resolve({ ok: true, jobs: JOBS }));

    await lookUp(user, "Roofing", "BR1");

    expect(await screen.findByRole("heading", { name: "20 more, with the address" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Try it free for 14 days" })).toHaveAttribute(
      "href",
      "/?start=trial&ref=ad-jobs",
    );
    // The price beside the button, so nothing reads like a catch (KES-168).
    expect(
      screen.getByText(
        "No card needed. After 14 days, keep it for £29 a month, or stay on our free plan and pay nothing.",
      ),
    ).toBeVisible();
    expect(screen.getAllByText("Address shown in the free trial")).toHaveLength(3);
    // The email form already has their trade and postcode.
    expect(screen.getByRole("combobox", { name: "Your trade" })).toHaveValue("Roofing");
    expect(screen.getAllByRole("textbox", { name: "Your postcode" })[1]).toHaveValue("BR1");
  });

  it("counts the visit, the look-up and the trial tap under the ad's code", async () => {
    const { user, recordStep } = renderPage(() => Promise.resolve({ ok: true, jobs: JOBS }));

    await lookUp(user, "Roofing", "BR1");
    await user.click(await screen.findByRole("link", { name: "Try it free for 14 days" }));

    expect(recordStep.mock.calls).toEqual([
      ["jobs_viewed", { source: "ad-jobs" }],
      ["jobs_searched", { source: "ad-jobs" }],
      ["trial_tapped", { source: "ad-jobs" }],
    ]);
  });

  it("starts with the trade the link was for, folded away, so the box is on the first screen (KES-160, KES-168)", async () => {
    const load = vi.fn<LoadJobs>(() => Promise.resolve({ ok: true, jobs: JOBS }));
    const { user } = renderPage(load, vi.fn(), "Roofing");

    expect(screen.getByRole("heading", { level: 1, name: "Roofing jobs near you" })).toBeVisible();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByText("Roofing", { selector: "strong" })).toBeVisible();
    await lookUp(user, "", "BR6");

    expect(load).toHaveBeenCalledWith("BR6", "Roofing");
  });

  it("lets someone from an ad change the trade (KES-168)", async () => {
    const load = vi.fn<LoadJobs>(() => Promise.resolve({ ok: true, jobs: JOBS }));
    const { user } = renderPage(load, vi.fn(), "Roofing");

    await user.click(screen.getByRole("button", { name: "Change trade" }));
    expect(screen.getByRole("radio", { name: "Roofing" })).toBeChecked();
    await lookUp(user, "Landscaping", "BR6");

    expect(load).toHaveBeenCalledWith("BR6", "Landscaping");
  });

  it("has no way off the page above the search (KES-168)", () => {
    renderPage(vi.fn<LoadJobs>());

    expect(screen.queryByRole("link", { name: "Back to Kestlow" })).toBeNull();
  });

  it("shows an example postcode beside the box, not in it (KES-160)", () => {
    renderPage(vi.fn<LoadJobs>());

    const postcode = screen.getByRole("textbox", { name: "Your postcode" });
    expect(postcode).not.toHaveAttribute("placeholder");
    expect(postcode).toHaveAccessibleDescription("Like BR6 or SE9 2AB");
  });

  it("asks for a trade and a postcode before looking", async () => {
    const load = vi.fn<LoadJobs>();
    const { user } = renderPage(load);

    await lookUp(user, "", "BR1");
    expect(screen.getByRole("alert")).toHaveTextContent("Pick your trade.");

    await user.click(screen.getByRole("radio", { name: "Electrical" }));
    await user.clear(screen.getByRole("textbox", { name: "Your postcode" }));
    await user.click(screen.getByRole("button", { name: "Show me the jobs" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Type your postcode, like BR6.");
    expect(screen.getByRole("textbox", { name: "Your postcode" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(load).not.toHaveBeenCalled();
  });

  it("says what the API says is wrong with the postcode", async () => {
    const { user } = renderPage(() =>
      Promise.resolve({
        ok: false,
        error: "We can't find ZZ9 9ZZ. Check it and try again.",
        field: "postcode",
      }),
    );

    await lookUp(user, "Roofing", "zz99zz");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We can't find ZZ9 9ZZ. Check it and try again.",
    );
  });

  it("says when the look-up fails", async () => {
    const { user } = renderPage(() => Promise.reject(new Error("offline")));

    await lookUp(user, "Roofing", "BR1");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Try again in a moment.",
    );
  });

  it("says where Kestlow covers when there are no jobs near them", async () => {
    const { user } = renderPage(() =>
      Promise.resolve({ ok: true, jobs: { ...JOBS, postcode: "M1", total: 0, examples: [] } }),
    );

    await lookUp(user, "Roofing", "M1");

    const answer = await screen.findByRole("region", { name: "No roofing jobs near M1 yet" });
    expect(
      within(answer).getByText(/Kestlow covers \d+ councils across London and Kent/),
    ).toBeVisible();
    expect(screen.queryByRole("link", { name: "Try it free for 14 days" })).toBeNull();
  });
});
