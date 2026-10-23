import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { localDatabaseTarget } from "./database-target";
import { provisionOwner } from "./provision-owner-core";

async function hiddenPassword(): Promise<string> {
  if (!process.stdin.isTTY) throw new Error("Use an interactive terminal for the hidden password prompt.");
  process.stdout.write("Owner password (hidden): ");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let password = "";
    const finish = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") { finish(); reject(new Error("Provisioning cancelled.")); return; }
        if (char === "\r" || char === "\n") { finish(); resolve(password); return; }
        if (char === "\u007f" || char === "\b") password = password.slice(0, -1);
        else if (char >= " " && password.length < 129) password += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--database" || !["vienna_cuts", "vienna_cuts_test"].includes(args[1])) {
    throw new Error("Usage: npm run owner:provision -- --database vienna_cuts (or vienna_cuts_test)");
  }
  const target = localDatabaseTarget(process.env.DATABASE_URL, args[1]);
  console.log(`Target: ${target.host}:${target.port}/${target.database}`);
  if (!process.stdin.isTTY) throw new Error("An interactive terminal is required.");
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const confirmation = await prompt.question(`Type ${target.database} to confirm this target: `);
  if (confirmation !== target.database) { prompt.close(); throw new Error("Target confirmation did not match."); }
  const email = await prompt.question("Owner email: ");
  const name = await prompt.question("Owner name: ");
  prompt.close();
  const password = await hiddenPassword();
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const result = await provisionOwner(db, { email, name, password });
    console.log(result.created ? "Owner account created." : "Owner already exists; credentials unchanged.");
  } finally { await db.$disconnect(); }
}

main().catch((error: unknown) => {
  // Only emit predefined messages. Never dump arbitrary exceptions, which can
  // contain credentials, SQL parameters or connection details.
  const safeMessages = [
    "Usage: npm run owner:provision -- --database vienna_cuts (or vienna_cuts_test)",
    "DATABASE_URL is required.",
    "Refusing database operation: expected local vienna_cuts with public schema.",
    "Refusing database operation: expected local vienna_cuts_test with public schema.",
    "An interactive terminal is required.",
    "Use an interactive terminal for the hidden password prompt.",
    "Target confirmation did not match.",
    "Provisioning cancelled.",
    "A valid email, name (1–100 characters), and password (12–128 characters) are required.",
    "Existing account is not a provisioned owner. No credentials or roles were changed.",
    "An owner already exists. No account was created.",
  ];
  const safeMessage = error instanceof Error
    ? safeMessages.find((message) => message === error.message)
    : undefined;
  console.error(safeMessage ?? "Owner provisioning failed. Verify the target, input, and existing owner; no credentials were overwritten.");
  if (error && typeof error === "object" && "code" in error &&
      typeof error.code === "string" && /^P\d{4}$/.test(error.code)) {
    console.error(`Database error code: ${error.code}. Connection details and query parameters were omitted.`);
  }
  process.exitCode = 1;
});
