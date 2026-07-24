# Contributing to blihops-admin

This guide defines the local setup, Git workflow, quality checks, and pull
request process for `blihops-admin`.

## Prerequisites

Install the versions declared by the repository:

| Tool    | Version                   |
| ------- | ------------------------- |
| Node.js | `24.18.0`                 |
| pnpm    | `11.17.0`                 |
| Git     | Current supported release |

The Node requirement is recorded in `.nvmrc` and `package.json`. The exact pnpm
release is pinned by the `packageManager` field in `package.json`.

## Local Setup

```bash
git clone https://github.com/blih-tech/blihops-admin.git
cd blihops-admin

npm install --global corepack@latest
corepack enable pnpm

pnpm install --frozen-lockfile
pnpm dev
```

On Windows, run `corepack enable pnpm` from an Administrator PowerShell if the
command cannot write to `C:\Program Files\nodejs`.

Open [http://localhost:3000](http://localhost:3000).

## GitHub Flow

Start every change from an updated `main`:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/dashboard-shell
```

Use lowercase kebab-case after one of these prefixes:

| Change                 | Pattern          | Example                     |
| ---------------------- | ---------------- | --------------------------- |
| Product feature        | `feature/<name>` | `feature/dashboard-shell`   |
| Bug fix                | `fix/<name>`     | `fix/sidebar-overflow`      |
| Tooling or maintenance | `chore/<name>`   | `chore/update-dependencies` |
| Documentation          | `docs/<name>`    | `docs/add-project-guides`   |
| Continuous integration | `ci/<name>`      | `ci/add-test-job`           |
| Urgent production fix  | `hotfix/<name>`  | `hotfix/broken-login`       |

The pre-push hook rejects other branch names. Do not develop directly on
`main`.

## Commit Messages

Commits follow Conventional Commits and are checked by commitlint:

```text
type(optional-scope): short imperative description
```

Common types:

| Type       | Use                                             |
| ---------- | ----------------------------------------------- |
| `feat`     | User-facing functionality                       |
| `fix`      | Defect correction                               |
| `docs`     | Documentation only                              |
| `chore`    | Tooling, dependencies, or maintenance           |
| `ci`       | CI configuration                                |
| `refactor` | Internal restructuring without behavior changes |
| `test`     | Automated tests                                 |
| `style`    | Formatting-only changes                         |

Examples:

```text
feat: add dashboard shell
feat(auth): add session timeout notice
fix: prevent sidebar overflow
docs: document local setup
chore: update dependencies
ci: add test job
```

Use imperative descriptions, keep the subject concise, and do not end it with a
period.

## Local Git Hooks

`pnpm install` runs the `prepare` script and configures Husky automatically.

| Hook         | Action                                       |
| ------------ | -------------------------------------------- |
| `pre-commit` | Runs lint-staged against staged files        |
| `commit-msg` | Validates the commit message with commitlint |
| `pre-push`   | Validates the current branch name            |

Do not routinely bypass hooks with `--no-verify`. Fix the reported problem
instead.

## Code Style

- EditorConfig controls indentation, line endings, and final newlines.
- Prettier is the formatting source of truth.
- ESLint applies Next.js and TypeScript rules.
- VS Code workspace settings enable the repository versions of these tools.
- Use the `@/*` alias for imports from `src`.

Format changed files before committing:

```bash
pnpm format
```

## Environment And Secrets

Environment files are ignored with `.env*`; only `.env.example` is tracked.

When adding a variable:

1. Add a placeholder and short description to `.env.example`.
2. Add the real local value to `.env.local`.
3. Configure deployed values in the hosting platform.
4. Never place credentials or secrets in tracked files.

CI rejects tracked `.env` variants. If a secret is committed, rotate it
immediately; removing the file in a later commit is not sufficient.

## Dependency Policy

Use pnpm exclusively:

```bash
pnpm add <package>
pnpm add --save-dev <package>
pnpm remove <package>
```

Do not use `npm install`, Yarn, or Bun. Only `pnpm-lock.yaml` is accepted.

Dependency overrides belong in `pnpm-workspace.yaml` and must include a clear
security or compatibility reason in the pull request. Run the audit after
dependency changes:

```bash
pnpm audit --audit-level=high
```

## Before Opening A Pull Request

Run the same project checks used by CI:

```bash
pnpm audit --audit-level=high
pnpm check
git diff --check
```

Review the staged changes and ensure no generated files, environment files, or
unrelated edits are included.

## Pull Requests

Push the branch:

```bash
git push -u origin feature/dashboard-shell
```

Open a pull request into `main` and complete every relevant section of the pull
request template:

```bash
gh pr create --base main --fill
```

Pull requests should:

- Explain what changed and why.
- Stay focused on one concern.
- Include verification steps.
- Include screenshots for visible UI changes.
- Reference related issues when available.
- Resolve all review conversations before merging.

CODEOWNERS automatically requests the responsible reviewer. Use a squash or
rebase merge so `main` retains a linear history.

## Continuous Integration

The `quality` job runs for pull requests into `main` and pushes to `main`. It
must pass before merge.

CI performs these checks:

1. Reject alternative package-manager lockfiles.
2. Reject tracked environment files except `.env.example`.
3. Install with the frozen pnpm lockfile.
4. Fail on high-severity dependency advisories.
5. Run ESLint.
6. Run the TypeScript checker.
7. Check Prettier formatting.
8. Build the production application.

If CI fails, reproduce the failing command locally, fix the underlying issue,
commit the correction, and push to the same branch.

## After Merge

Update local `main` and remove the completed branch:

```bash
git switch main
git pull --ff-only origin main
git branch -d feature/dashboard-shell
```

Do not force-push or commit directly to protected `main`.
