import { config } from "dotenv";
import { Pool } from "pg";
import { localDatabaseTarget } from "./database-target";

async function main() {
  const loaded = config({ path: ".env.test", override: true, quiet: true });
  if (loaded.error) throw new Error("Test configuration unavailable.");
  const target = localDatabaseTarget(process.env.DATABASE_URL, "vienna_cuts_test");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN READ ONLY");
      const { rows: [summary] } = await client.query<{
        database: string; read_only: string; users: number; owners: number;
        accounts: number; sessions: number; overlap_constraint: boolean; auth_migration: boolean;
      }>(`
        SELECT current_database() AS database,
          current_setting('transaction_read_only') AS read_only,
          (SELECT count(*)::int FROM public."user") AS users,
          (SELECT count(*)::int FROM public."user"
            WHERE 'admin' = ANY(string_to_array(COALESCE(role, ''), ','))) AS owners,
          (SELECT count(*)::int FROM public.account) AS accounts,
          (SELECT count(*)::int FROM public.session) AS sessions,
          EXISTS(SELECT 1 FROM pg_constraint
            WHERE conname = 'Appointment_no_active_overlap'
              AND conrelid = 'public."Appointment"'::regclass AND contype = 'x') AS overlap_constraint,
          EXISTS(SELECT 1 FROM public._prisma_migrations
            WHERE migration_name = '20261023023750_add_owner_auth'
              AND finished_at IS NOT NULL AND rolled_back_at IS NULL) AS auth_migration
      `);
      if (summary.database !== target.database || summary.read_only !== "on") {
        throw new Error("Unexpected database target or transaction mode.");
      }
      // Only aggregate, non-secret data is emitted; no account identities,
      // connection credentials, password hashes, cookies or tokens are selected.
      console.log(JSON.stringify({ target: `${target.host}:${target.port}/${target.database}`, ...summary }));
      await client.query("ROLLBACK");
      if (summary.owners !== 0 || !summary.overlap_constraint || !summary.auth_migration) {
        throw new Error("Test database requires review before integration tests.");
      }
    } finally { client.release(); }
  } finally { await pool.end(); }
}

main().catch(() => {
  console.error("Test database preflight failed; no records were changed. Review the local target, schema and owner count before running tests.");
  process.exitCode = 1;
});
