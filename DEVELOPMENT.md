# Vienna Cuts — Developer Setup

## Requirements

- WSL Ubuntu (recommended for Windows)
- Node.js 22
- npm
- PostgreSQL
- Git

## 1. Clone the repository

```bash
git clone https://github.com/nehal765/viennacuts.git
cd viennacuts
git fetch origin
git switch -c feature/foundation-testing --track origin/feature/foundation-testing
```

Note: The feature branch must be pushed to GitHub first.

## 2. Install dependencies

```bash
npm ci
```

## 3. Start PostgreSQL

```bash
sudo service postgresql start
pg_isready -h localhost -p 5432
```

## 4. Create the local database

Open PostgreSQL:

```bash
sudo -u postgres psql
```

Run:

```sql
CREATE USER vienna_dev WITH PASSWORD 'YOUR_LOCAL_PASSWORD';
ALTER ROLE vienna_dev CREATEDB;
CREATE DATABASE vienna_cuts OWNER vienna_dev;
```

Exit PostgreSQL using \q.

Use a unique password for your own computer.

## 5. Configure environment variables

```bash
cp .env.example .env
```

Edit .env and replace YOUR_LOCAL_PASSWORD with your actual
local PostgreSQL password.

Never commit .env to Git.

## 6. Prepare the database

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

## 7. Start the application

```bash
npm run dev
```

Open http://localhost:3000.

## 8. Run tests

Unit tests:

```bash
npm run test:unit
```

Database integration tests:

```bash
npm run test:integration
```

All tests:

```bash
npm test
```

## 9. Run quality checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Git workflow

- Work in your own feature branch.
- Do not push directly to main.
- Commit small, meaningful changes.
- Push feature branches to GitHub.
- Open pull requests for review.
- Merge dependent milestone branches in order.

## Notes

The barbers, schedules, prices, and services are fictional
demonstration data.

Never use production credentials in local testing.
