import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes every cell and doubles inner quotes", () => {
    expect(toCsv(["a", "b"], [['say "hi"', 1]])).toBe('\uFEFF"a","b"\r\n"say ""hi""","1"\r\n');
  });
  it("neutralises cells that a spreadsheet would run as a formula", () => {
    const out = toCsv(["x"], [["=HYPERLINK(\"evil\")"], ["+1"], ["@cmd"]]);
    expect(out).toContain('" =HYPERLINK');
    expect(out).toContain('" +1"');
    expect(out).toContain('" @cmd"');
  });
  it("writes blanks for missing values", () => {
    expect(toCsv(["x", "y"], [[null, undefined]])).toContain('"",""');
  });
});
