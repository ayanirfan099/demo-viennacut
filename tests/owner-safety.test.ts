import { describe, expect, it } from "vitest";
import { localDatabaseTarget } from "../scripts/database-target";
import { isBanned, isOwnerRole } from "../src/lib/owner/access";

describe("database safety guard", () => {
  it.each(["localhost", "127.0.0.1", "[::1]"])("accepts only the explicitly named local test target on %s", (host) => {
    expect(localDatabaseTarget(`postgresql://user:password@${host}:5432/vienna_cuts_test?schema=public`, "vienna_cuts_test").database).toBe("vienna_cuts_test");
  });
  it.each([
    undefined,
    "postgresql://localhost/vienna_cuts",
    "postgresql://remote.example/vienna_cuts_test",
    "postgresql://localhost.attacker.example/vienna_cuts_test",
    "postgresql://localhost/vienna_cuts_test?host=remote.example",
    "postgresql://localhost/vienna_cuts_test?schema=private",
    "postgresql://localhost/vienna_cuts_test?options=-csearch_path=private",
    "https://localhost/vienna_cuts_test",
  ])("refuses unsafe test target %s", (value) => {
    expect(() => localDatabaseTarget(value, "vienna_cuts_test")).toThrow();
  });
});

it("matches complete admin roles and respects active and expired bans", () => {
  expect(isOwnerRole("user,admin")).toBe(true);
  for (const role of ["user", "superadmin", "administrator", "owner", "", null, undefined]) expect(isOwnerRole(role)).toBe(false);
  expect(isBanned({ banned: true })).toBe(true);
  expect(isBanned({ banned: true, banExpires: new Date(Date.now() + 60_000) })).toBe(true);
  expect(isBanned({ banned: true, banExpires: new Date(0) })).toBe(false);
  expect(isBanned({ banned: false })).toBe(false);
});
