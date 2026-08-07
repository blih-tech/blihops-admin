---
name: context7-docs
description: >
  Always use the Context7 MCP server to retrieve the latest official documentation
  before writing code, explaining libraries, or making implementation decisions.
  This skill ensures generated code matches the project's installed versions instead
  of relying on model memory.
priority: critical
---

# Context7 Documentation Skill

## Purpose

Never rely solely on model knowledge when working with external libraries,
frameworks, SDKs, CLIs, APIs, or developer tools.

Always retrieve the official documentation through Context7 before generating
code or making implementation decisions.

---

# Mandatory Rules

## Rule 1 — Check documentation first

Whenever a task involves ANY external library, framework, SDK, API, CLI,
database, language feature, runtime, or tool:

Use Context7 FIRST.

Examples:

- React
- Next.js
- Vite
- Node.js
- Express
- NestJS
- Fastify
- Hono
- TypeScript
- Prisma
- Drizzle
- PostgreSQL
- Redis
- Docker
- Kubernetes
- AWS
- Azure
- Cloudflare
- OpenAI SDK
- Anthropic SDK
- Gemini SDK
- Tailwind
- shadcn/ui
- Zod
- React Hook Form
- TanStack Query
- Zustand
- Redux Toolkit
- Framer Motion

Never assume documentation from memory is correct.

---

## Rule 2 — Match the project's installed version

When working inside an existing project:

1. Inspect package.json
2. Detect installed package version
3. Fetch documentation for THAT version using Context7
4. Generate code that matches the installed version

Never generate examples from newer or older versions.

Examples:

Good:

Project uses

Next 16.0.1

→ Use Next 16 documentation.

Bad:

Project uses Next 15

→ Agent generates Next 16 App Router APIs.

---

## Rule 3 — Teaching Mode

Whenever teaching a topic involving a library or framework:

Always use Context7 first.

Teach from the latest stable official documentation.

Do not teach deprecated APIs.

If breaking changes exist:

- explain what changed
- explain why
- teach the recommended approach

---

## Rule 4 — Existing Codebase

When editing an existing project:

Use Context7 to verify:

- API names
- configuration
- recommended patterns
- migrations
- deprecations
- breaking changes

before suggesting modifications.

---

## Rule 5 — New Projects

When creating a new project:

Use the latest stable documentation.

Prefer modern APIs.

Avoid deprecated syntax.

Avoid legacy examples.

---

## Rule 6 — Resolve uncertainty

If documentation conflicts with model knowledge:

Documentation wins.

Never prioritize memory over official docs.

---

## Rule 7 — Explain version differences

If the requested code differs across versions:

Explain:

- what changed
- which version is installed
- why the generated code matches that version

---

## Rule 8 — Never hallucinate APIs

If Context7 cannot find an API:

Do not invent it.

State that the API does not exist or verify alternatives using the documentation.

---

## Rule 9 — Prefer official patterns

Always follow the patterns recommended in the official documentation instead of
community conventions unless the user explicitly asks otherwise.

---

## Rule 10 — Cite the documentation internally

Whenever possible:

- retrieve documentation
- reason from it
- generate code based on it

instead of relying on remembered examples.

---

# Workflow

For every coding task:

1. Identify external libraries.
2. Detect installed versions.
3. Retrieve documentation via Context7.
4. Verify the APIs.
5. Generate implementation.
6. Explain any breaking changes if relevant.

Never skip this workflow.

---

# Examples

## Example 1

User:

Create a Next.js middleware.

Agent:

✓ Detect Next version.

✓ Fetch Next documentation.

✓ Generate middleware matching that version.

---

## Example 2

User:

Add Prisma transaction.

Agent:

✓ Detect Prisma version.

✓ Fetch Prisma docs.

✓ Use transaction API from that version.

---

## Example 3

User:

Teach me React 19.

Agent:

✓ Fetch React 19 docs.

✓ Teach latest APIs.

✓ Mention deprecated patterns.

---

## Example 4

User:

Implement authentication using Supabase.

Agent:

✓ Detect installed Supabase SDK version.

✓ Retrieve docs.

✓ Follow official authentication guide.

---

# Priority

This skill has HIGH priority.

Documentation retrieved through Context7 always overrides model memory when discussing external libraries, frameworks, SDKs, APIs, and developer tooling.
