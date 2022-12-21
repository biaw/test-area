import { fitText } from "./text";

describe("fitText", () => {
  it("should return the string if it is shorter than the length", () => expect(fitText("hello", 10)).toBe("hello"));
  it("should return the string if it is equal to the length", () => expect(fitText("hello", 5)).toBe("hello"));
  it("should return the string if it is shorter than the length and includeTrail is false", () => expect(fitText("hello", 10, false)).toBe("hello"));
  it("should cut the string if it is longer than the length and includeTrail is false", () => expect(fitText("hello", 4, false)).toBe("hell"));
  it("should handle trail", () => expect(fitText("hello", 4)).toBe("hel…"));
});
