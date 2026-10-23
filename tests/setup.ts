import { localDatabaseTarget } from "../scripts/database-target";

// Runs before test modules can import Prisma or execute fixture writes.
localDatabaseTarget(process.env.DATABASE_URL, "vienna_cuts_test");
