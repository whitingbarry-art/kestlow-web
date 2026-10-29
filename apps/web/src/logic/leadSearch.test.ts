import { loadSort, saveSort, searchFromUrl, urlWithSearch } from "./leadSearch";

describe("searchFromUrl", () => {
  it("reads the search from the query string", () => {
    expect(searchFromUrl("?q=Chislehurst")).toBe("Chislehurst");
    expect(searchFromUrl("?q=%20BR7%206LT%20")).toBe("BR7 6LT");
  });

  it("is empty when there's no search", () => {
    expect(searchFromUrl("")).toBe("");
    expect(searchFromUrl("?token=abc")).toBe("");
  });
});

describe("urlWithSearch", () => {
  it("sets the search, keeping the rest of the address", () => {
    expect(urlWithSearch("https://kestlow.co.uk/?ref=email#top", "BR7 6LT")).toBe(
      "/?ref=email&q=BR7+6LT#top",
    );
  });

  it("replaces an earlier search", () => {
    expect(urlWithSearch("https://kestlow.co.uk/?q=Eltham", "Chislehurst")).toBe("/?q=Chislehurst");
  });

  it("takes the search out when it's blank", () => {
    expect(urlWithSearch("https://kestlow.co.uk/?q=Eltham", "  ")).toBe("/");
  });
});

describe("loadSort and saveSort", () => {
  const memory = () => {
    const items = new Map<string, string>();
    return {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => void items.set(key, value),
    };
  };

  it("remembers the chosen sort", () => {
    const storage = memory();
    saveSort(storage, "nearest");
    expect(loadSort(storage)).toBe("nearest");
  });

  it("starts with newest first", () => {
    expect(loadSort(memory())).toBe("newest");
    expect(loadSort(undefined)).toBe("newest");
  });

  it("ignores a saved value it doesn't know", () => {
    const storage = memory();
    storage.setItem("kestlow.leadSort", "cheapest");
    expect(loadSort(storage)).toBe("newest");
  });

  it("never throws when storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(loadSort(blocked)).toBe("newest");
    expect(() => saveSort(blocked, "nearest")).not.toThrow();
  });
});
