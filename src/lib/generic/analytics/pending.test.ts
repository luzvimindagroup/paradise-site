import { describe, expect, it } from "vitest";
import { encodePending, parsePending } from "./pending";

describe("pending events", () => {
  it("round-trips an event and its source", () => {
    expect(parsePending(encodePending("waitlist_submit", "join"))).toEqual({
      event: "waitlist_submit",
      params: { source: "join" },
    });
  });
  it("ignores empty or malformed values", () => {
    expect(parsePending(undefined)).toBeNull();
    expect(parsePending("")).toBeNull();
    expect(parsePending("just-one-part")).toBeNull();
    expect(parsePending("bad event|x")).toBeNull();
    expect(parsePending("e|<script>")).toBeNull();
  });
});
