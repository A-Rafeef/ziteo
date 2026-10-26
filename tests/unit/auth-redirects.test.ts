import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/supabase/redirects";

describe("authentication redirect boundaries", () => {
  it.each([undefined, null, "https://evil.example", "//evil.example", "/\\evil.example", "/auth/signout", "/auth/callback?next=https://evil.example", "/login"])("rejects an unsafe return path %s", (value) => {
    expect(safeNext(value)).toBe("/");
  });
  it("preserves a local workspace destination", () => {
    expect(safeNext("/?view=products#website")).toBe("/?view=products#website");
  });
});
