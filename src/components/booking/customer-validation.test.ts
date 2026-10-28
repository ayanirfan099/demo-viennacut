import { describe, expect, it } from "vitest";
import { validateCustomerFields } from "./customer-validation";

describe("customer details before booking review", () => {
  it("rejects whitespace-only details rather than allowing an invalid review", () => {
    expect(
      validateCustomerFields({ name: "  ", email: "  ", phone: "" }),
    ).toEqual({ name: "required", email: "required" });
  });
  it("accepts a valid international name and surrounding whitespace", () => {
    expect(
      validateCustomerFields({
        name: "  Jürgen Müller  ",
        email: " demo@example.com ",
        phone: " +43 123 456 ",
      }),
    ).toEqual({});
  });
  it("flags invalid email and oversized fields individually", () => {
    expect(
      validateCustomerFields({
        name: "a".repeat(101),
        email: "name@domain",
        phone: "1".repeat(31),
      }),
    ).toEqual({ name: "invalid", email: "invalid", phone: "invalid" });
  });
});
