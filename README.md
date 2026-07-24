# blihops-admin

Internal administration frontend for BlihOps. This repository currently
provides the application and engineering foundation; administrative features
and external integrations will be added as their requirements are defined.

## Status

The project is an early Next.js scaffold with its team workflow, quality gates,
and dependency policies configured. The generated starter page remains in place
until the first product feature is implemented.

## Stack

| Layer           | Choice                |
| --------------- | --------------------- |
| Framework       | Next.js 16 App Router |
| UI runtime      | React 19              |
| Language        | TypeScript 5          |
| Styling         | Tailwind CSS 4        |
| Linting         | ESLint 9              |
| Formatting      | Prettier 3            |
| Package manager | pnpm 11 only          |
| Git hooks       | Husky and lint-staged |
| CI              | GitHub Actions        |

## Requirements

| Tool    | Version                   |
| ------- | ------------------------- |
| Node.js | `24.18.0`                 |
| pnpm    | `11.17.0`                 |
| Git     | Current supported release |

Node and pnpm requirements are enforced by `.nvmrc`, `package.json`, Corepack,
and `pnpm-workspace.yaml`.

## Quick Start

```bash
git clone https://github.com/blih-tech/blihops-admin.git
cd blihops-admin

npm install --global corepack@latest
corepack enable pnpm

pnpm install --frozen-lockfile
pnpm dev
```

On Windows, `corepack enable pnpm` may require an Administrator PowerShell.

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Local environment files are ignored by Git. `.env.example` is the tracked
template and must contain placeholders only.

When a feature introduces environment variables, create a local file from the
template:

```bash
cp .env.example .env.local
```

PowerShell equivalent:

```powershell
Copy-Item .env.example .env.local
```

Never commit `.env`, `.env.local`, production credentials, tokens, or private
keys. CI rejects tracked environment files other than `.env.example`.

## Commands

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the development server                 |
| `pnpm build`        | Create a production build                    |
| `pnpm start`        | Run the production build                     |
| `pnpm lint`         | Run ESLint                                   |
| `pnpm typecheck`    | Run TypeScript without emitting files        |
| `pnpm format`       | Format supported files with Prettier         |
| `pnpm format:check` | Check formatting without changing files      |
| `pnpm check`        | Run lint, typecheck, format check, and build |

## Repository Structure

```text
blihops-admin/
|-- .github/
|   |-- workflows/ci.yml        # Pull request and main quality gate
|   |-- CODEOWNERS              # Automatic review ownership
|   `-- PULL_REQUEST_TEMPLATE.md
|-- .husky/                     # Commit message, pre-commit, and pre-push hooks
|-- public/                     # Static assets
|-- src/
|   `-- app/                    # App Router layouts, pages, and global styles
|-- .env.example               # Environment variable template
|-- pnpm-workspace.yaml        # pnpm policy and dependency overrides
`-- package.json
```

Add new top-level source directories only when the application needs them. Keep
route composition in `src/app` and move reusable code into focused directories
as the product grows.

## Development Workflow

The repository follows GitHub Flow:

1. Update local `main`.
2. Create a short branch using an allowed prefix.
3. Commit using Conventional Commits.
4. Push the branch and open a pull request into `main`.
5. Merge only after the `quality` check and required reviews pass.

Allowed branch prefixes are `feature/`, `fix/`, `chore/`, `docs/`, `ci/`, and
`hotfix/`.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the complete workflow.

## Quality And Security

Local hooks provide fast feedback:

| Hook         | Check                               |
| ------------ | ----------------------------------- |
| `pre-commit` | ESLint and Prettier on staged files |
| `commit-msg` | Conventional Commit format          |
| `pre-push`   | Branch naming convention            |

GitHub Actions is the authoritative gate. CI verifies the lockfile policy,
environment-file policy, high-severity dependency audit, linting, type safety,
formatting, and production build.

Only `pnpm-lock.yaml` is allowed. Do not create or commit npm, Yarn, or Bun
lockfiles.

## Related Repository

- [`blihops-web`](https://github.com/blih-tech/blihops-web): public BlihOps
  marketing website.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before starting work.
