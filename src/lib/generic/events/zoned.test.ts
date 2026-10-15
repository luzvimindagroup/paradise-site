import { describe, expect, it } from "vitest";
import { formatZoned, utcToZonedInput, zonedToUtcIso } from "./zoned";

const LA = "America/Los_Angeles";

describe("zoned time", () => {
  it("uses daylight time in spring (UTC-7)", () => {
    expect(zonedToUtcIso("2027-04-10T19:00", LA)).toBe("2027-04-11T02:00:00.000Z");
  });
  it("uses standard time in winter (UTC-8)", () => {
    expect(zonedToUtcIso("2027-01-15T19:00", LA)).toBe("2027-01-16T03:00:00.000Z");
  });
  it("round-trips back to what was typed", () => {
    for (const t of ["2027-04-10T19:00", "2027-01-15T19:00", "2027-11-07T00:30"]) {
      expect(utcToZonedInput(zonedToUtcIso(t, LA)!, LA)).toBe(t);
    }
  });
  it("rejects garbage", () => {
    expect(zonedToUtcIso("tomorrow", LA)).toBeNull();
    expect(zonedToUtcIso("", LA)).toBeNull();
  });
  it("rejects dates that would silently roll over or don't exist", () => {
    expect(zonedToUtcIso("2027-02-31T19:00", LA)).toBeNull();
    expect(zonedToUtcIso("2027-13-01T19:00", LA)).toBeNull();
    expect(zonedToUtcIso("2027-04-10T25:00", LA)).toBeNull();
    expect(zonedToUtcIso("2027-03-14T02:30", LA)).toBeNull(); // skipped hour when clocks spring forward
  });
  it("formats in the named zone", () => {
    expect(formatZoned("2027-04-11T02:00:00.000Z", LA)).toBe("Sat, Apr 10, 7:00 PM");
  });
});
