import { checkPassword, isAcceptable } from "./password";

describe("checking a new password (KES-167)", () => {
  it.each([
    ["password123", "weak"],
    ["Password1!", "weak"],
    ["hG7kq2Lm", "good"],
    ["ladder teapot rain", "strong"],
  ] as const)("rates %j as %s", (password, strength) => {
    expect(checkPassword(password).strength).toBe(strength);
  });

  it("accepts Good and Strong, and refuses Weak", () => {
    expect(isAcceptable("weak")).toBe(false);
    expect(isAcceptable("good")).toBe(true);
    expect(isAcceptable("strong")).toBe(true);
  });

  it("ticks every rule for a strong password", () => {
    expect(checkPassword("ladder teapot rain", ["Dave Roofer"]).rules).toEqual({
      long: true,
      notPersonal: true,
      hardToGuess: true,
    });
  });

  it("notices their own name, and a password that's too short", () => {
    expect(checkPassword("dave1", ["Dave Roofer"]).rules).toEqual({
      long: false,
      notPersonal: false,
      hardToGuess: false,
    });
  });

  it("says how to improve a Good one, and why a Weak one is weak", () => {
    expect(checkPassword("hG7kq2Lm").tip).toBe("That will do. Another word would make it Strong.");
    expect(checkPassword("password123").tip).toMatch(/commonly used password/);
    expect(checkPassword("ladder teapot rain").tip).toBeNull();
    expect(checkPassword("daveroofer", ["Dave Roofer"]).tip).toBe("Leave out your name and email.");
  });
});
