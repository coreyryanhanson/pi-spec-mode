# Changelog

## Unreleased

- `/spec list`: every spec, refused ones included, with its `Status`, `Last verified` and how many days ago. Also in the `/spec` menu.
- `/spec agree` refuses a spec with an empty section: write "None" when nothing applies.

## 0.0.1-beta4

- The bash filter refuses `$(…)` hidden behind a `'` that bash does not treat as a quote (inside `"…"`, after `\`, in a comment). A command mixing a single-quoted `$` with `"`, `\`, `#` or `<<` is now refused.
- The bash filter refuses `2>&1x`: a `2>&1` redirect must end the word.
- Spec names match `.md` in any case: on macOS and Windows, writing `0001_spec_x.MD` no longer skips the "only `/spec agree` agrees" check.
- Spec mode writes only Markdown (`.md`) files under the specs folder, so the agent cannot plant a git config that `git status` would run.
- The bash filter refuses a word starting with a glob (`sort *`): a file named `-o` in the project would turn it into a flag. Write `./*` instead. `$@`, `$*` and `$1` are refused too.
- Spec mode refuses to write through a symbolic link under the specs folder (or the specs folder itself being one): a link shipped by a cloned repo can no longer send writes outside.
- `/spec implement` accepts an implemented spec that was extended and agreed again (`Status` back to `Agreed` in `specs/Implemented/`).
- `/spec <request>` starting with a command word (`/spec verify that login works offline`, `/spec start with…`) is sent as a request: `start`, `exit`, `off`, `agree`, `verify`, `template` and `settings` run only when typed alone.

## 0.0.1-beta3

- Spec mode writes exactly the path it checked: paths that pi rewrites (`@x`, `~/x`, `file://…`) can no longer escape the specs folder.
- Only `/spec agree` makes a spec `Agreed`: a spec the agent sets to `Agreed` goes back to `Draft`, in spec mode and during `/spec verify`.
- `/spec verify`: an `Agreed` spec whose content changes goes back to `Draft`; stamping `Last verified` alone keeps it `Agreed`.
- The agent cannot change `specs/spec_template.md` in spec mode or during `/spec verify`.
- A project whose own path contains a folder starting with `-` can write specs again.
- The bash filter refuses `>/dev/nullx`.

## 0.0.1-beta2

- Spec mode's bash filter is now an allowlist: each allowed command accepts only known read flags; `awk` and `less` are no longer allowed. Shell expansions that could produce a flag (`${…}`, `$'…'`, `$VAR`, `{a,b}`) are refused.
- Spec mode refuses file and folder names starting with `-`.
- `/spec agree` refuses a spec whose `Status` header row is missing, instead of reporting it agreed.
- README: npm, license, pi and node badges.

## 0.0.1-beta1

- Spec mode refuses read commands whose flags write files or run commands: `sort`/`tree -o`, `git --output`/`-O`, `rg --pre`, `fd --exec`, `find -fls`. `sed` is accepted only as `sed -n '<lines>p'`.
- Spec numbering and lookup work with Windows paths.
- Editing an Agreed spec bumps `Version` once, even when the edit already bumped it.

## 0.0.1-alpha3

- `/spec refuse [spec]`: sets a spec to `Refused`, adds a warning line on top and moves it to `specs/Refused/`. Refused specs are kept but skipped by `/spec verify`, `/spec implement` and the agent; their numbers are never reused.
- A spec whose `Status` is set to `Refused` by hand or by the agent is moved the same way.
- `/spec restore <spec>`: moves a refused spec back to `specs/` as `Draft`.
- `/spec` menu offers refuse and restore.
- `verifyCount` setting: how many specs `/spec verify` checks per run (default 2).
- Spec mode is entered only through `/spec` commands: trigger phrases removed.
- README: workflow diagram.

## 0.0.1-alpha2

- Spec mode accepts rtk-rewritten read commands, `cd` and redirects to `/dev/null`.
- `/spec settings` shows which settings files exist.

## 0.0.1-alpha

- First release: spec mode with write restrictions, `/spec agree`, `/spec verify`, `/spec implement` (via `@narumitw/pi-plan-mode`) and a generic spec template.
