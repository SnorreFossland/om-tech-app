import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Vitest will import this file as a setup file. Running the preparation at
// top-level ensures the scripts execute before tests start.
async function prepareTestDatabase() {
    const testDb = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
    if (!testDb) {
        // nothing to do — tests will skip if no DB
        console.warn('test/setup: no TEST_DATABASE_URL or DATABASE_URL set; tests that need DB will be skipped.');
        return;
    }

    try {
        console.log('test/setup: ensuring Prisma schema is pushed to', testDb);
        const start = Date.now();

        // Ensure the child process AND the running Node process see DATABASE_URL
        // pointing at the test DB so `prisma db push` and any imported Prisma
        // clients in test modules use the same database.
        process.env.DATABASE_URL = testDb;
        const childEnv = { ...process.env, DATABASE_URL: testDb };

        // Push the schema to the test DB
        execSync(`npx prisma db push --schema=prisma/schema.prisma`, { stdio: 'inherit', env: childEnv, timeout: 120_000 });
        // Generate the Prisma client unless it already exists (speeds repeated runs)
        const generatedClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
        if (fs.existsSync(generatedClientPath)) {
            console.log('test/setup: Prisma client already exists at', generatedClientPath, '- skipping `prisma generate`.');
        } else {
            execSync(`npx prisma generate`, { stdio: 'inherit', env: childEnv, timeout: 60_000 });
        }

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`test/setup: finished preparing test DB in ${elapsed}s`);
    } catch (e: any) {
        console.error('test/setup: failed to prepare test database:', e?.message ?? e);
        throw e;
    }
}

// Immediately invoke so Vitest (which imports this file) executes the setup.
// Do not `export` — top-level execution is what Vitest expects for setupFiles.
void prepareTestDatabase();

