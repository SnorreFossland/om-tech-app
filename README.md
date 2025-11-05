This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing and debugging

This repository includes integration tests that run against a local SQLite test database. Use the helper script to prepare the DB, generate the Prisma client, run a single integration test, and then run the full `test:db` script. Logs are captured to `vitest-templates.log` and `test-db-full.log`.

Run the helper locally:

```bash
# prepare DB, generate client, run single test and then the full test:db script
pnpm run debug:test
```

CI: a GitHub Actions workflow (`.github/workflows/test-db.yml`) is included that runs `pnpm run test:db` on push and pull requests. If your tests need additional environment variables (for example `AUTH_SECRET`), add them as repository secrets in GitHub.

Troubleshooting tips:

- If `prisma db push` or `prisma generate` hangs, remove the local `test-dev.db` file and try again:

```bash
rm -f test-dev.db
pnpm run debug:test
```

- If tests appear to hang inside Vitest workers, run a single test file with:

```bash
TEST_DATABASE_URL="file:./test-dev.db" pnpm exec vitest run test/integration/templates.spec.ts --reporter verbose
```

CI secrets guidance

If your app depends on runtime secrets (for example `AUTH_SECRET`, `NEXTAUTH_URL` or other environment variables), add them to your repository's Actions secrets so the workflow can use them.

1. Go to: Settings -> Secrets -> Actions in your GitHub repository.
2. Click "New repository secret" and add a key/value pair (for example `AUTH_SECRET` with a random 32+ byte value).
3. The workflow will receive the secret as an environment variable. To reference additional secrets in the workflow, add them under the job's `env` or use `secrets.NAME` in the step that needs them.

Local exec permissions

Make the debug script executable locally (so you can run `pnpm run debug:test` without `bash`):

```bash
chmod +x scripts/debug-test.sh
```


