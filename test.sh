#!/usr/bin/env bash
#
# Runs the unit tests with coverage, then the end to end tests.
# Pass --unit to skip the browser tests.

set -euo pipefail

cd "$(dirname "$0")"

run_e2e=true
if [ "${1:-}" = "--unit" ]; then
  run_e2e=false
fi

echo "==> Unit tests with coverage"
npm run test:coverage

if [ "$run_e2e" = true ]; then
  echo
  echo "==> End to end tests"
  npm run test:e2e
fi

echo
echo "==> Coverage report"
echo "file://$PWD/coverage/lcov-report/index.html"
