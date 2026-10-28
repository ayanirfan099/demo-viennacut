export type CustomerFields = { name: string; email: string; phone: string };
export type CustomerFieldErrors = Partial<
  Record<keyof CustomerFields, "required" | "invalid">
>;

/** Match the public form's contact requirements before entering review. */
export function validateCustomerFields(
  customer: CustomerFields,
): CustomerFieldErrors {
  const errors: CustomerFieldErrors = {};
  if (!customer.name.trim()) errors.name = "required";
  else if (customer.name.trim().length < 2 || customer.name.trim().length > 100)
    errors.name = "invalid";
  if (!customer.email.trim()) errors.email = "required";
  else if (
    customer.email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())
  )
    errors.email = "invalid";
  if (customer.phone.trim().length > 30) errors.phone = "invalid";
  return errors;
}
