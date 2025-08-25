Frontend development commands and hooks

- `npm run lint`: run ESLint.
- `npm run lint:fix`: run ESLint with auto-fixes.
- `npm test`: run unit tests with Vitest (watch mode in some setups).
- `npm run test:ci`: run Vitest once (CI-friendly).

Pre-commit hook (no extra deps)

This repo includes a Git hook script to run ESLint and tests before each commit.

Enable it by pointing Git to the hooks directory:

git config core.hooksPath frontend-question/.githooks

Disable it by unsetting the config:

git config --unset core.hooksPath

