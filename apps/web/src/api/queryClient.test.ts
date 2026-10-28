import { ApiError } from "./leads";
import { createQueryClient } from "./queryClient";

describe("createQueryClient", () => {
  it("treats a 401 as signed out, without retrying", async () => {
    const client = createQueryClient();
    client.setQueryData(["me"], { id: "1", name: "Dave", email: "d@example.com" });
    const queryFn = vi.fn(() => Promise.reject(new ApiError(401, "GET /leads failed with 401")));

    await client.fetchQuery({ queryKey: ["leads"], queryFn }).catch(() => undefined);

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(["me"])).toBeNull();
  });

  it("keeps the session and retries once for other errors", async () => {
    const client = createQueryClient();
    const me = { id: "1", name: "Dave", email: "d@example.com" };
    client.setQueryData(["me"], me);
    const queryFn = vi.fn(() => Promise.reject(new ApiError(500, "GET /leads failed with 500")));

    await client.fetchQuery({ queryKey: ["leads"], queryFn, retryDelay: 0 }).catch(() => undefined);

    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(client.getQueryData(["me"])).toEqual(me);
  });
});
