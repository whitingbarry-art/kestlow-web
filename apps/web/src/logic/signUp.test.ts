import { openedToSignUp, signUpHref, sourceFrom, withoutSignUp } from "./signUp";

describe("signing up from the launch page (KES-125)", () => {
  it("links to Create your account, carrying the card or ad's code", () => {
    expect(signUpHref("screwfix-bromley")).toBe("/?start=trial&ref=screwfix-bromley");
    expect(signUpHref()).toBe("/?start=trial");
  });

  it("reads where the app was opened from", () => {
    expect(openedToSignUp("?start=trial&ref=ad-trial")).toBe(true);
    expect(openedToSignUp("?q=Bromley")).toBe(false);
    expect(sourceFrom("?start=trial&ref=ad-trial")).toBe("ad-trial");
    expect(sourceFrom("?start=trial")).toBeUndefined();
  });

  it("drops only its own parts of the address once the account is made", () => {
    expect(withoutSignUp("https://kestlow.co.uk/?start=trial&ref=ad-trial&q=BR1")).toBe(
      "https://kestlow.co.uk/?q=BR1",
    );
    expect(withoutSignUp("https://kestlow.co.uk/?start=trial")).toBe("https://kestlow.co.uk/");
  });
});
