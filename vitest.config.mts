
import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { localDatabaseTarget } from "./scripts/database-target";

config({ path: fileURLToPath(new URL("./.env.test", import.meta.url)), override: true, quiet: true });
localDatabaseTarget(process.env.DATABASE_URL, "vienna_cuts_test");
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.BETTER_AUTH_SECRET = randomBytes(48).toString("base64url");

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/mocks/server-only.ts", import.meta.url)
      ),
      "@": fileURLToPath(
        new URL("./src", import.meta.url)
      ),
    },
  },
  test: {
    setupFiles: ["./tests/setup.ts"],
    // Existing integration suites temporarily change the same seeded barbers
    // and services. Serial files prevent those changes racing other suites.
    fileParallelism: false,
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "tests/**/*.test.ts",
    ],
  },
});
