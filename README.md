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

## E2E tests (Playwright)

[![E2E Tests](https://github.com/SnorreFossland/om-tech-app/actions/workflows/e2e.yml/badge.svg?branch=feature/001-property-sales-platform)](https://github.com/SnorreFossland/om-tech-app/actions/workflows/e2e.yml)

This repository includes Playwright end-to-end tests and a GitHub Actions workflow that runs them.

- Local quick run (parallel):

```bash
BASE=http://127.0.0.1:3000 npx playwright test
```

- CI-friendly / serial run (recommended for local verification):

```bash
npm run test:e2e:ci
```

More details are in `docs/E2E-README.md`.


Local E2E / Playwright notes
-----------------------------

The Next dev server can bind to IPv6 or IPv4 interfaces which may make local test runners try the wrong address (127.0.0.1 vs ::1). If you see connection refused errors from Playwright or curl, start the dev server bound to the IPv4 loopback to make localhost/127.0.0.1 reliable for tests:

```bash
HOST=127.0.0.1 npm run dev
```

To automatically detect a reachable base URL and run the Playwright E2E suite, use the helper script included in `./scripts`:

```bash
# detect a working base and run the e2e tests
node scripts/run-e2e.js
```

This script will prefer `127.0.0.1:3000` and fall back to `localhost:3000` or your machine's LAN IP if necessary.

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
