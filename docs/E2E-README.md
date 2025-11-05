E2E (Playwright) local run

## Quick guide to run Playwright E2E locally against the Next dev server

## Prerequisites

- Start the dev server: `npm run dev` (make sure it listens on `http://127.0.0.1:3000`).
- Ensure database is up-to-date: `npx prisma db push`.

### Run tests (parallel)

```bash
BASE=http://127.0.0.1:3000 npx playwright test
```

### Run tests (serial, CI-friendly)

Recommended for local verification to reduce flakiness:

```bash
npm run test:e2e:ci
```

## Notes

- The tests use the development-only `/api/dev/mint-session` endpoint to mint a dev user and set a `dev-user-id` cookie. That endpoint is guarded by `NODE_ENV === 'development'`.
- If tests fail due to unique-constraint races, run the serial script above. The codebase now uses atomic upserts for property creation and dev-user minting to minimize these races.
- To cleanup test data run: `npm run test:cleanup`.
