import { createHttpSendContact, type ContactMessage } from "./contact";
import { ApiError } from "./leads";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const MESSAGE: ContactMessage = {
  name: "Dave",
  email: "dave@example.com",
  topic: "feedback",
  message: "Love it.",
  website: "",
};

describe("createHttpSendContact", () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const send = createHttpSendContact("/api");

  beforeEach(() => vi.stubGlobal("fetch", fetch));
  afterEach(() => {
    fetch.mockReset();
    vi.unstubAllGlobals();
  });

  it("posts the message as JSON", async () => {
    fetch.mockResolvedValue(json({ status: "sent" }));

    await expect(send(MESSAGE)).resolves.toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual(MESSAGE);
  });

  it("returns the fields that need fixing", async () => {
    const fields = { email: "Enter a valid email address." };
    fetch.mockResolvedValue(json({ error: "Some answers need fixing.", fields }, 400));

    await expect(send(MESSAGE)).resolves.toEqual({ ok: false, errors: fields });
  });

  it.each([429, 502])("throws on a %i", async (status) => {
    fetch.mockResolvedValue(json({ error: "nope" }, status));

    await expect(send(MESSAGE)).rejects.toBeInstanceOf(ApiError);
  });
});
