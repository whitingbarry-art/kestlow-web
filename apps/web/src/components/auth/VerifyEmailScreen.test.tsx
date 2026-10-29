import { render, screen } from "@testing-library/react";
import { createSampleAuthApi, SAMPLE_TOKEN, SAMPLE_USER } from "../../api/sampleAuthApi";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { providers } from "../../test/providers";
import { VerifyEmailScreen } from "./VerifyEmailScreen";

const renderVerify = (token: string | null, authApi = createSampleAuthApi(null)) => {
  render(<VerifyEmailScreen token={token} />, {
    wrapper: providers(createSampleLeadsApi(), authApi),
  });
  return authApi;
};

describe("VerifyEmailScreen", () => {
  it("confirms the email as soon as the link opens", async () => {
    const authApi = renderVerify(
      SAMPLE_TOKEN,
      createSampleAuthApi({ ...SAMPLE_USER, emailVerified: false }),
    );

    expect(await screen.findByRole("heading", { name: "Email confirmed" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Go to Kestlow" })).toHaveAttribute("href", "/");
    expect((await authApi.getMe())?.emailVerified).toBe(true);
  });

  it("says when the link has expired or been used", async () => {
    renderVerify("old");

    expect(await screen.findByRole("heading", { name: "That didn't work" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(/expired or has already been used/);
  });

  it("asks only once, as a used link can't be used again", async () => {
    const authApi = createSampleAuthApi(null);
    const verifyEmail = vi.spyOn(authApi, "verifyEmail");
    renderVerify(SAMPLE_TOKEN, authApi);

    await screen.findByRole("heading", { name: "Email confirmed" });
    expect(verifyEmail).toHaveBeenCalledTimes(1);
  });
});
