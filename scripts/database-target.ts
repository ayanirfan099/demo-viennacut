export function localDatabaseTarget(value: string | undefined, expected: string) {
  if (!value) throw new Error("DATABASE_URL is required.");
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.pathname !== `/${expected}` ||
      [...url.searchParams.keys()].some((key) => key !== "schema") ||
      (url.searchParams.has("schema") && url.searchParams.get("schema") !== "public")) {
    throw new Error(`Refusing database operation: expected local ${expected} with public schema.`);
  }
  return { host: url.hostname, port: url.port || "5432", database: expected };
}
