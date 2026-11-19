# AGENTS.md

Rules for any agent working in this repo. Read them before the first edit.

## Project in one line

A pi extension (`src/index.ts` → `src/core.ts`, `src/prompts.ts`) that adds `/spec`: write, agree, verify and hand a spec to plan mode. Plain TypeScript, no build step, no runtime dependency beyond the pi peer deps (`@earendil-works/pi-coding-agent`, `typebox`). `templates/spec_template.md` and `examples/` ship in the package: a change to the spec format updates them too.

## Commits

- **One commit per feature or bug fix.** Nothing unrelated in it: no drive-by refactors, no formatting noise, no stray file.
- Conventional prefix, matching the history: `feat:`, `fix:`, `docs:`, `ci:`, `chore:`, `refactor:`, `test:`.
- Message: what changed for the user, not the diff. Subject in the imperative, lower case after the prefix, no trailing period. Body when the *why* is not obvious.
- Stage by path (`git add src/core.ts test/core.test.ts`). Never `git add -A` / `git add .`; local files are listed in `.gitignore` and never committed.
- **Never `git commit`, never `git push`, never tag, never publish (`npm publish`), never cut a release, never rewrite history (`rebase` on pushed commits, `reset --hard`, `commit --amend` on pushed commits) without an explicit yes from the user.** Finish the change, then show the paths you would stage and the exact message, plus the commands, and wait for the yes: "done" is not a yes.
- A release means a version heading in `CHANGELOG.md`, a bump of `package.json`'s version, and a tag; until the user asks, changes go under the existing `## unreleased` heading.
- Don't create a branch, merge, or force anything unless asked.

## Before saying "done"

Both must pass, and you run them yourself. If a check fails and you cannot fix it, say so and stop:

```bash
npm run typecheck   # tsc --noEmit, strict
npm test            # node --test test/*.test.ts
```

- If `tsc` cannot even start (a `node_modules/` installed on another machine or platform, e.g. `Unable to resolve @typescript/typescript-<platform>`), do not reinstall or edit `node_modules/`: run the same check from a throwaway install of the TypeScript major `package.json` uses (`npm i --prefix /tmp/tsc typescript@7`, then `/tmp/tsc/node_modules/.bin/tsc --noEmit -p tsconfig.json`), and say in your report that the project's own script could not run and which version you used.
- **Every feature comes with unit tests**, in the same commit: no feature is "done" without them. New behaviour in `core.ts` (a branch, a parser, a filter, a path rule) leaves a test in `test/core.test.ts`. Extension/flow changes go in `test/extension.test.ts`.
- A bug fix comes with a test that fails before and passes after.
- A test asserts behaviour, not implementation: one case per rule or edge case the feature adds (empty input, refused path, unchanged status...), named after the behaviour.
- No test for a typo or a doc line. Don't lower the bar to make a test pass.

## Code

- `src/core.ts` = pure logic, testable without pi. `src/index.ts` = extension wiring and tool handlers. Put logic in `core.ts`, not in the handler.
- Keep it boring: standard library and what is already imported. **No new dependency** without asking first; there are no runtime deps and that is on purpose. Don't touch `package-lock.json` unless a dependency actually changed, and then ask.
- Follow the existing style: small exported functions, template strings, short one-line comments in English explaining *why*. No `any`, no `@ts-ignore`.
- Smallest change that fully works. No option, setting, or abstraction nobody asked for. Delete before adding.
- Comments and identifiers in English; the same for README, CHANGELOG and commit messages.

## Invariants — do not break these

The security model is the product. An edit that relaxes one of these is a bug, not a feature:

- In spec mode the agent writes **only Markdown files inside the specs folder**; no symlink traversal (`isInside`, `lstat` checks), no write outside `specs/`.
- The shell allowlist stays a **read-only** allowlist: unknown command → refused, glob/redirect/`-o file` style argument → refused. Prefer refusing to guessing.
- The file pattern `NNNN_spec_<feature>.md`, the `Status` / `Last verified` header fields, and the `specs/Implemented/` + `specs/Refused/` moves keep working; hand-edited specs stay readable.
- `/spec verify` never changes a spec's status; `spec_complete` stays the only way to close a spec.
- Settings keys and defaults stay backward compatible (`specsDir`, `language`, `verifyCount`); an unknown/absent settings file must not throw.
- A spec describes behaviour, never code; don't hand-edit `specs/Implemented/`, it is a record.

## Docs

- Any user-visible change (command, option, status, flow) updates `README.md` and `CHANGELOG.md` (under `## unreleased`) in the same commit. Never invent a version heading.
- `src/prompts.ts` is the contract sent to the model: a prompt edit that changes what the agent does in a flow is a user-visible change, even if no test breaks. Add a test on the prompt text when the rule matters (e.g. a refused action stays mentioned).

## Never

- Commit secrets, `.env`, tokens, or a local absolute path.
- Touch `node_modules/` or loosen `.github/workflows/test.yml`.
- Delete `specs/`, `audits/`, `todo.md`, or user files; ask first.
