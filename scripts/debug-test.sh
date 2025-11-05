#!/usr/bin/env bash
set -euo pipefail

# Debug helper: prepares TEST DB, generates prisma client, runs a single test file and the full test:db script
# Usage: bash scripts/debug-test.sh

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

export TEST_DATABASE_URL="file:./test-dev.db"
export DEBUG="prisma:client,vitest:*"

# Force Prisma to use the binary engine on this machine to avoid dynamic library
# load issues on macOS (arm64) and ensure a matching native binary is generated.
export PRISMA_CLIENT_ENGINE_TYPE=binary

echo "[debug-test] TEST_DATABASE_URL=$TEST_DATABASE_URL"

echo "[debug-test] Running prisma db push..."
time npx prisma db push --schema=prisma/schema.prisma

echo "[debug-test] Running prisma generate..."
# Remove any previously-generated native client to avoid corrupted/incorrect
# engine binaries lingering in node_modules/.prisma
rm -rf node_modules/.prisma || true
time npx prisma generate

echo "[debug-test] Listing generated client dir..."
ls -la node_modules/.prisma/client || true

SINGLE_LOG=vitest-templates.log
FULL_LOG=test-db-full.log

echo "[debug-test] Running single test (integration/templates.spec.ts)"
TEST_DATABASE_URL="$TEST_DATABASE_URL" pnpm exec vitest run test/integration/templates.spec.ts --reporter verbose 2>&1 | tee "$SINGLE_LOG"

echo "[debug-test] Running full test:db script"
TEST_DATABASE_URL="$TEST_DATABASE_URL" pnpm run test:db 2>&1 | tee "$FULL_LOG"

echo "[debug-test] Done. Single log: $SINGLE_LOG, Full log: $FULL_LOG"
