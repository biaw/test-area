import { msToHumanShortTime } from "./time";

describe("msToHumanShortTime", () => {
  it("should handle no seconds", () => expect(msToHumanShortTime(0)).toBe("0s"));
  it("should handle simple conversion", () => {
    expect(msToHumanShortTime(1000)).toBe("1s");
    expect(msToHumanShortTime(10000)).toBe("10s");
    expect(msToHumanShortTime(60000)).toBe("1m");
    expect(msToHumanShortTime(3600000)).toBe("1h");
    expect(msToHumanShortTime(86400000)).toBe("1d");
  });
  it("should handle complex conversion", () => {
    expect(msToHumanShortTime(1000 + 60000 + 3600000 + 86400000)).toBe("1d1h1m1s");
    expect(msToHumanShortTime(1000 + 60000 + 3600000)).toBe("1h1m1s");
    expect(msToHumanShortTime(1000 + 60000)).toBe("1m1s");
    expect(msToHumanShortTime(1000)).toBe("1s");
  });
});
