export function authOrigin(): string {
  const value = process.env.BETTER_AUTH_URL;
  if (!value) throw new Error("BETTER_AUTH_URL is required.");
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("BETTER_AUTH_URL must be an HTTP(S) origin.");
  }
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("Non-local authentication requires HTTPS.");
  }
  return url.origin;
}
