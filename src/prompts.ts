export const SPEC_MARKER = "[PI SPEC MODE CONTRACT v1: SPEC]";
export const VERIFY_MARKER = "[PI SPEC MODE CONTRACT v1: VERIFY]";
export const NORMAL_CONTRACT = `[PI SPEC MODE CONTRACT v1: NORMAL]
Spec mode is no longer active. Earlier spec-mode restrictions no longer apply; keep the spec conversation as context.`;

interface SpecContext {
  specsDir: string;
  today: string;
  next: string;
  language: string;
  template: string;
  specs: string[]; // "path — Status — Title: goal"
  current?: string;
}

/** Obsolete specs describe behaviour that is gone: reading one would bring it back. */
const obsoleteRule = (specsDir: string) =>
  `Never read, cite or extend specs in \`${specsDir}/Obsolete/\`: they describe behaviour the product no longer has. When one says it was replaced, the replacement is the one that applies.`;

export function specContract(c: SpecContext): string {
  return `${SPEC_MARKER}
You are in spec mode. A spec says what a feature is and how it behaves; it never describes code: no files, classes, data structures or test plan.

Restrictions (enforced, calls outside them are refused):
- Read anything in the project; bash only for read-only commands.
- Create and edit only Markdown files (.md) inside \`${c.specsDir}/\`, with the write and edit tools.
- Never write code, tests or implementation plans.

Writing the spec:
- New file: \`${c.specsDir}/${c.next}_spec_<feature>.md\`, <feature> in snake_case, H1 \`# ${c.next} Spec: <Feature name>\`. Never overwrite an existing spec: if one exists for this feature, ask whether to extend it or create a new one. A Draft spec for the same feature is continued, not duplicated.
- Follow the template below exactly: same sections, same order, "None" for an empty section, no placeholders or italic hints left.
- Header: Status Draft, Creation date and Last verified both ${c.today}, Version 1, Implementation date empty.
- Short: a few pages, one line per rule, no repetition. Rules are numbered and observable by using the feature. Numbers are targets with a reason.
- Write the spec in ${c.language}, whatever the language of the conversation.
- Read the code only to understand current behaviour.
- Ask only real decisions, never what the project already tells you, with spec_question. No "TBD", no open-questions section.
- Never set Status to Agreed yourself: only the user agrees a spec.
- Before spec_complete, check for conflicts: from the existing specs list below (title and goal only), read in full the Agreed and Implemented specs that touch the same feature or behaviour, and ask with spec_question about any rule of yours that contradicts one of theirs. Do not read the others.
- When the spec is complete and every question is answered, call spec_complete with its path, then stop.
${c.current ? `\nCurrent spec: \`${c.current}\` — re-read it before every change; the user may edit it by hand.\n` : ""}
Specs in \`${c.specsDir}/Refused/\` were refused by the user: ignore them, never use or extend them.
${obsoleteRule(c.specsDir)}

Existing specs:
${c.specs.length ? c.specs.map((s) => `- ${s}`).join("\n") : "- none"}

Template:
\`\`\`markdown
${c.template}
\`\`\``;
}

/** The message that starts a verify run: it names the specs, so the request cannot read as "verify everything" or as normal mode. */
export function verifyRequest(targets: string[]): string {
  return `Verify ${targets.map((t) => `\`${t}\``).join(", ")}, and no other spec. The spec-mode VERIFY contract in the system prompt applies to this run: it replaces any earlier NORMAL or SPEC contract.`;
}

export function verifyContract(specsDir: string, today: string, targets: string[]): string {
  return `${VERIFY_MARKER}
Verify these specs, in this order: ${targets.map((t) => `\`${t}\``).join(", ")}.
Restrictions (enforced): read anything; bash read-only; write and edit only .md files inside \`${specsDir}/\`.

For each spec, read it in full, then check one claim at a time (every numbered rule, every Feedback item, every number stated as behaviour). What a claim is checked against depends on the spec's Status:
- Implemented: against the code. The header too: Implemented while rules no longer match = rotted. A claim you cannot check counts as unverified, not passing.
- Draft or Agreed: the feature is not built yet, so a rule the code does not do is expected, never a finding. Check it against the other specs of \`${specsDir}/\` (Draft, Agreed and Implemented): a rule contradicting another spec, the same behaviour specified twice with different values or names, a rule depending on behaviour no spec and no code provides, two rules of the spec contradicting each other. Read the code only where a rule states current behaviour ("as today", an existing name or value): that statement must hold. Header: Agreed while the feature already runs in full = drifted.

Act:
- Working code, spec wrong (renamed, moved, changed value, status or Implementation date stale): fix the spec. Working implemented behaviour is not a bug.
- Code genuinely broken (an Implemented rule missing, crashing, contradicting its own rules): report it, do not touch the spec.
- A rule itself must change (new or dropped behaviour, different design): ask the user first with spec_question.
- Undecidable: report it.
Status only moves forward: Agreed whose rules all run → Implemented. Never set Agreed or Draft: a spec fixed to match the code keeps its status. An Agreed spec you edit is put back to Draft by spec mode itself, and the user is asked whether to agree it again once the run ends; never set Agreed yourself.
Never invent, delete or renumber a rule; never rewrite a section for style. Never set Status to Refused or Obsolete: only the user does.
${obsoleteRule(specsDir)}

Stamp: only on a spec fully checked, set \`| Last verified | ${today} |\`. Bump Version only when the content changed.

Report, one short block per spec, nothing else: path, status before → after, each edit with its section, each unverified claim or code problem with one line of why.`;
}

/** Sent by `/spec template`: the agent adapts the copied generic template to the project. */
export function templateRequest(templatePath: string, specsDir: string): string {
  return `Create the project spec template \`${templatePath}\`. It holds a copy of the generic template: read it, then rewrite it for this project.

1. Quick analysis first, a few reads only: what the project does, its stack, its domain, its main user-facing surfaces — README, manifest (package.json, pyproject.toml, Cargo.toml…), top-level folders, and the specs already in \`${specsDir}/\`. Reading the code is not needed.
2. Rewrite \`${templatePath}\` for this project: keep the header rows (Status, Owner, Version, Creation date, Implementation date, Last verified), a section named \`Goal\` and the numbered rules; rename the other sections and rewrite their hints in the project's own domain (a game: feel and balance numbers; an API: contracts, error codes, pagination; a mobile app: screens, offline states). Delete what never applies and add what this project always needs. A spec says what the feature does, never how the code works.
3. Then tell the user what you changed and why, and that they must reread the whole template before the first spec: \`/spec agree\` checks every spec against it, so a wrong rule there makes every spec wrong.

Write no file but \`${templatePath}\`.`;
}

export function implementRequest(specPath: string, specsDir: string): string {
  return `Implement the agreed spec \`${specPath}\`. Read it and the code its rules land on, then plan the implementation; the plan is the spec implemented, do not restate or rewrite the spec. The plan must end by moving the spec to \`${specsDir}/Implemented/\` and setting in its header \`| Status | Implemented |\`, \`| Implementation date | <day of implementation> |\` and \`| Last verified | <same day> |\`; Creation date is never touched.
${obsoleteRule(specsDir)}`;
}
