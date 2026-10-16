import { describe, expect, it } from "vitest";
import { checkImage, sniffImage } from "./validate";

describe("checkImage", () => {
  it("allows small jpg/png/webp only", () => {
    expect(checkImage({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(checkImage({ type: "image/gif", size: 1000 })).not.toBeNull();
    expect(checkImage({ type: "image/png", size: 5 * 1024 * 1024 })).not.toBeNull();
  });
});

describe("sniffImage", () => {
  it("recognizes real images by their first bytes", () => {
    expect(sniffImage(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImage(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
  });
  it("rejects anything else, whatever it claims to be", () => {
    expect(sniffImage(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
  });
});
