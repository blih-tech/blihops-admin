# blihops-admin

Internal administration platform for [BlihOps](https://blihops.com) — the
outsourcing platform connecting global companies with pre-vetted Ethiopian
software engineers.

BlihOps Admin is where the BlihOps team runs its V1 operations: authenticated
management of leads, companies, talent, and the managed website content that
powers the public site. It talks exclusively to the `blihops-api` backend and
never touches the database directly.

## Status

The application foundation and the **managed website content** feature are
shipped and used in production. Auth, the dashboard shell, the rich-text
editor, media uploads, and all nine content resources are implemented.

The operations modules (Dashboard, Leads, Companies) are placeholder pages that
ship with the next operational features. `Talent → Applications / Profiles`
and `Settings → Email templates / Cal.com` pages exist as scaffolds.

## Stack

| Layer            | Choice                                   |
| ---------------- | ---------------------------------------- |
| Framework        | Next.js 16 App Router                    |
| UI runtime       | React 19                                 |
| Language         | TypeScript 5                             |
| Styling          | Tailwind CSS 4                           |
| Auth             | better-auth (server-side via API)        |
| Server state     | TanStack Query v5                        |
| Rich text        | Tiptap (custom block/image nodes)        |
| Media uploads    | Vercel Blob (route handler, server-side) |
| Forms/validation | React Hook Form + zod                    |
| Linting          | ESLint 9                                 |
| Formatting       | Prettier 3                               |
| Package manager  | pnpm 11 only                             |
| Git hooks        | Husky and lint-staged                    |
| CI               | GitHub Actions                           |

## Requirements

| Tool    | Version                   |
| ------- | ------------------------- |
| Node.js | `24.18.0`                 |
| pnpm    | `11.17.0`                 |
| Git     | Current supported release |

Node and pnpm requirements are enforced by `.nvmrc`, `package.json`, Corepack,
and `pnpm-workspace.yaml`.

## Quick Start

The admin console needs the API running with its local Postgres:

```bash
# 1. API (separate terminal)
cd ../blihops-api
docker compose up -d db
cp .env.example .env
pnpm db:generate && pnpm db:migrate
pnpm dev                                    # http://localhost:4000

# 2. Admin
cd ../blihops-admin
npm install --global corepack@latest
corepack enable pnpm
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev                                    # http://localhost:3001
```

On Windows, `corepack enable pnpm` may require an Administrator PowerShell.

Sign in with an admin account created via the API seed:

```bash
# in blihops-api, with SEED_ADMIN_PASSWORD set in .env
pnpm seed:admin
```

## Environment Variables

Local environment files are ignored by Git. `.env.example` is the tracked
template and must contain placeholders only. Copy it to `.env.local` before
running the app. Never commit `.env`, `.env.local`, production credentials,
tokens, or private keys — CI rejects tracked environment files other than
`.env.example`.

| Variable                | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | API base URL used by the browser (better-auth client, `apiFetch`)     |
| `API_URL`               | Server-side API base URL used by `proxy.ts` for session validation    |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for admin uploads — server-side only, never bundled |

The session cookie (`blihops.session_token`) is validated against
`GET /api/v1/auth/get-session` by `src/proxy.ts`; requests without a valid
admin session redirect to `/auth/sign-in`.

## Commands

| Command             | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | Start the development server on port 3001       |
| `pnpm build`        | Create a production build                       |
| `pnpm start`        | Run the production build                        |
| `pnpm lint`         | Run ESLint                                      |
| `pnpm typecheck`    | Run TypeScript without emitting files           |
| `pnpm format`       | Format supported files with Prettier            |
| `pnpm format:check` | Check formatting without changing files         |
| `pnpm check`        | Run lint, typecheck, format check, audit, build |

## Features

### Operations (`/`)

| Section   | Route                                            | Status      |
| --------- | ------------------------------------------------ | ----------- |
| Dashboard | `/`                                              | Placeholder |
| Leads     | `/leads`                                         | Placeholder |
| Companies | `/companies`                                     | Placeholder |
| Talent    | `/talent/applications`                           | Scaffold    |
| Talent    | `/talent/profiles`                               | Scaffold    |
| Settings  | `/settings/email-templates`, `/settings/cal-com` | Scaffold    |

### Managed website content (`/content`)

The complete CMS backing the public site's structured content. Nine resources,
all persisted through the API's `/api/v1/content/admin/*` subtree:

| Resource      | Admin route              | Notes                                          |
| ------------- | ------------------------ | ---------------------------------------------- |
| Logos         | `/content/logos`         | Trusted-client logo cloud (home page)          |
| Testimonials  | `/content/testimonials`  | One primary testimonial (at-most-one rule)     |
| Services Hero | `/content/services-hero` | Hero video + cover image for the services page |
| Case Studies  | `/content/case-studies`  | EN + DE, publish/unpublish                     |
| Insights      | `/content/insights`      | EN + DE, publish/unpublish                     |
| Careers       | `/content/careers`       | English-only roles                             |
| FAQs          | `/content/faqs`          | EN + DE (pilot page)                           |
| Categories    | `/content/categories`    | Taxonomies for case studies/insights           |
| Tags          | `/content/tags`          | Taxonomies for case studies/insights           |

How it works:

- **Server state** — every list, detail, and mutation goes through TanStack
  Query over `apiFetch` (same transport as the web app). Mutations invalidate
  the matching list/detail keys on success.
- **Rich text** — case studies and insights use a custom Tiptap editor with
  block/image nodes and a template builder.
- **Media uploads** — the `/api/uploads` route handler streams images
  (≤ 5 MB) and videos (≤ 50 MB) to Vercel Blob with a server-side token; the
  returned URL is stored in the content payload.
- **Public propagation** — the web app fetches public content with ISR
  (revalidate ≈ 5 min), so published content appears on the site within the
  revalidation window. No webhook needed.

The full content feature design lives in
[`blihops-design/03-Engineering/features/content/`](https://github.com/blih-tech/blihops-design/tree/main/03-Engineering/features/content).

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
|   |-- proxy.ts                # Session validation + admin gate (edge)
|   |-- app/
|   |   |-- (auth)/             # sign-in, forgot/reset password
|   |   |-- (dashboard)/        # operations + content sections
|   |   |-- api/
|   |   |   |-- auth/           # better-auth route handler
|   |   |   `-- uploads/        # Vercel Blob upload route handler
|   |-- components/
|   |   |-- layout/             # App shell, sidebar, navigation
|   |   |-- sections/           # Page-level sections per feature
|   |   |-- shared/             # Cross-feature components
|   |   |-- tiptap-*/           # Rich-text editor UI and nodes
|   |   `-- ui/                 # Design-system primitives
|   |-- hooks/                  # Shared React hooks
|   |-- lib/
|   |   |-- api/                # apiFetch + per-resource content clients
|   |   |-- forms/              # Form builders and helpers
|   |   |-- query/              # TanStack Query setup
|   |   `-- validators/         # zod schemas shared with forms
|-- .env.example                # Environment variable template
|-- pnpm-workspace.yaml         # pnpm policy and dependency overrides
`-- package.json
```

Add new top-level source directories only when the application needs them. Keep
route composition in `src/app` and move reusable code into focused directories
as the product grows.

## Deployment

The admin console deploys to Vercel and runs at `admin.blihops.com`.

1. Connect the repo to Vercel and set the env vars from `.env.example`:
   - `NEXT_PUBLIC_API_URL` → `https://api.blihops.com`
   - `API_URL` → `https://api.blihops.com`
   - `BLOB_READ_WRITE_TOKEN` → production Vercel Blob token
2. Add `https://admin.blihops.com` to the API's `CORS_ORIGIN` (already the
   default per the deployment docs).
3. Push to `main` — Vercel auto-deploys; GitHub Actions runs the quality gate.

Full deployment architecture and runbook (Render + Neon + Vercel, env matrix,
rollout checklist) live in
[`blihops-design/03-Engineering/Deployment.md`](https://github.com/blih-tech/blihops-design/blob/main/03-Engineering/Deployment.md).

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

## Related Repositories

- [`blihops-web`](https://github.com/blih-tech/blihops-web): public BliHops
  marketing website (consumes the managed content).
- [`blihops-api`](https://github.com/blih-tech/blihops-api): Express + Prisma
  backend providing auth, email, and the content API.
- [`blihops-design`](https://github.com/blih-tech/blihops-design): product,
  UX, and engineering design docs.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before starting work.
