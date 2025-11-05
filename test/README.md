Integration tests

These tests use Vitest and Prisma to run simple integration checks against a database.

Setup
1. Install dev deps:

   pnpm install

2. Provide a test database connection. You can either set TEST_DATABASE_URL in your environment or rely on DATABASE_URL (not recommended).

   export TEST_DATABASE_URL="file:./test-dev.db"

3. Push schema to the test database:

   npx prisma db push --schema=prisma/schema.prisma

Run

pnpm test

Notes
- Tests will skip with a warning if neither TEST_DATABASE_URL nor DATABASE_URL is set.
- These tests directly use your Prisma schema and will create/delete records in the target DB. Use an isolated test DB to avoid affecting local development data.
