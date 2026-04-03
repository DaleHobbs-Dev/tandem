# Tandem

AI coding agents make developers faster. But speed creates a trap: the faster you ship, the less you understand what you shipped. Developers end up staring at code they can't explain, making architectural decisions they can't defend, and building on foundations they don't fully grasp.

Specs and documentation don't fix this. You can have a perfect PRD and still not understand how the code implements it.

**Tandem is pair programming that teaches.** A suite of Claude Code commands that guide you through the full lifecycle of building software, from planning through implementation, with a more experienced developer sitting next to you. You move fast and you understand what you built.

Ownership and speed. Not ownership or speed.

## Install

```bash
npx @tandemdev/cli init
```

This copies Tandem's commands to `.claude/commands/` and templates to `.tandem/templates/`. No global installs, no dependencies, no build step.

To update to the latest version, run the same command again. Your project's `tandem.json` and documentation are never overwritten.

## Commands

| Command | Purpose | Project Types |
|---|---|---|
| `/create-manifest` | Generate or update the `tandem.json` project manifest | All |
| `/create-prd` | Generate a PRD from a project idea | Greenfield |
| `/create-architecture` | Generate or reverse-engineer a technical architecture doc | All |
| `/create-roadmap` | Generate an ordered implementation plan from PRD | Greenfield |
| `/create-issues` | Convert roadmap steps into GitHub issues | Greenfield |
| `/pair-program` | Guided implementation with understanding checks | All |
| `/update-docs` | Update documentation when decisions change | All |
| `/create-adr` | Record an architecture decision | All |

## Quick Start: New Project (Greenfield)

```
/create-prd          # Define what you're building and why
/create-architecture # Design how to build it
/create-roadmap      # Break it into ordered steps
/pair-program step 1 # Start building, step by step
```

Each command feeds into the next. `/create-prd` produces a PRD, `/create-architecture` reads it to design the system, `/create-roadmap` reads both to plan the work, and `/pair-program` reads everything to guide implementation.

<details>
<summary><strong>Existing Project (Brownfield)</strong></summary>

```
/create-manifest           # Scan your repo and map existing docs
/create-architecture       # Reverse-engineer the system (optional, recommended)
/pair-program fix the auth bug  # Start working
```

`/create-manifest` scans your repo for documentation files and builds `tandem.json` so Tandem knows what docs exist and where they live. No need to reorganize anything; the manifest points to docs wherever they are.

`/create-architecture` in reverse-engineer mode scans the codebase and produces an architecture doc that maps out how the system works. Especially useful when inheriting a codebase you need to learn quickly.

`/pair-program` reads `tandem.json` and matches the task against each doc's scope, purpose, and tags to load only what's relevant. "Fix the auth bug" pulls in your backend and API docs but skips frontend styling guides. Architecture and conventions docs are always loaded so generated code follows your project's standards. This is why `/create-manifest` matters: it's how `/pair-program` knows what documentation exists and when to use it.

</details>

<details>
<summary><strong>Migration (Bluefield)</strong></summary>

```
/create-manifest           # Map existing docs
/create-architecture       # Document current state + target state
/create-roadmap            # Plan the migration steps
/pair-program step 1       # Start migrating
```

`/create-architecture` in migration mode documents both the current state (reverse-engineered from the codebase) and the target state (from your description or PRD), creating a document that serves as a migration roadmap.

</details>

## How It Works

### The Manifest (`tandem.json`)

Every Tandem project has a `tandem.json` file in the project root. It's a table of contents for your documentation: what docs exist, what they cover, and where they live.

```json
{
  "version": 1,
  "config": {
    "understandingChecks": true
  },
  "docs": [
    {
      "path": "dev-docs/PRD.md",
      "scope": "general",
      "purpose": "Product requirements, target users, tech stack decisions",
      "tags": ["prd", "requirements", "scope"]
    }
  ]
}
```

For greenfield projects, creation commands register their output automatically. For existing projects, `/create-manifest` scans the repo and builds it for you. You can also create it by hand using the template at `.tandem/templates/tandem.json` to save the tokens that a full repo scan would cost.

`/pair-program` uses the manifest to load only docs relevant to the current task, keeping context efficient.

<details>
<summary><strong>Suggested values for scope, purpose, and tags</strong></summary>

**Scope** describes which domain a doc covers. `/pair-program` uses this to filter docs by relevance to the current task.

| Value | Use for |
|---|---|
| `general` | Docs that apply to the whole project (PRD, architecture, roadmap) |
| `frontend` | UI components, styling, client-side logic |
| `backend` | Server, API, business logic |
| `database` | Schema, migrations, queries |
| `api` | Endpoint design, auth, request/response formats |
| `infrastructure` | Hosting, CI/CD, deployment, environments |

Use whatever values fit your project. These are conventions, not a fixed list.

**Purpose** is a one-line description of what the doc contains. This is what `/pair-program` reads to decide relevance without opening the file. Be specific enough that the right docs get loaded for the right tasks.

**Tags** are finer-grained keywords for matching. These conventional tags are searched for by Tandem commands:

| Tag | Used by |
|---|---|
| `prd` | `/create-architecture`, `/create-roadmap` look for this to find the PRD |
| `architecture` | `/pair-program` always loads this; `/create-adr` updates it |
| `roadmap` | `/pair-program` marks steps complete here; `/create-issues` reads it |
| `adr` | `/create-adr` finds the ADR directory |
| `conventions` | `/pair-program` always loads this for code standards |

Beyond these, use any tags that help match docs to tasks: `auth`, `payments`, `error-handling`, `testing`, etc.

</details>

### Understanding Checks

After each sub-step of implementation, `/pair-program` asks three questions to verify understanding. These are calibrated to your experience level and focused on what you're actively learning.

To turn them off project-wide, set `understandingChecks` to `false` in `tandem.json`. To skip once, just say "skip questions" during a session.

### Experience-Agnostic

Tandem adapts to whoever is using it. A junior developer gets foundational explanations ("here's what a middleware is and why we need one"). A senior developer gets peer-level trade-off discussion ("here's why I'd pick this middleware pattern over that one"). A staff engineer gets a second brain for architectural decisions.

Same commands, calibrated to the developer.

## Developer Profile (Optional)

Tandem works out of the box with zero configuration. But if you add a `## Developer Profile` section to your `~/.claude/CLAUDE.md`, the commands use it to personalize the experience: explanation depth, understanding check difficulty, and tech stack awareness.

A template is installed at `.tandem/templates/developer-profile.md` for reference.

<details>
<summary><strong>Example: Senior engineer transitioning to GenAI</strong></summary>

```markdown
## Developer Profile

### About Me
Senior full-stack engineer with 7+ years of experience, currently building
expertise in GenAI engineering. I learn best by building real projects, not
tutorials. I use AI tools extensively but insist on understanding every
significant implementation decision.

### Tech Stack
- **Languages:** Python, JavaScript/TypeScript, C#
- **Frontend:** React, React Native/Expo, Tailwind CSS
- **Backend:** FastAPI, Django, .NET
- **Data:** PostgreSQL, Supabase
- **AI/ML:** LangChain, LangGraph (learning), Pydantic
- **DevOps:** Docker (familiar), GitHub Actions (learning), Render

### Development Philosophy
- AI generates code, humans own it. I maintain architectural understanding
  of every decision.
- Avoid over-engineering. Research carefully, then build lean.
- Review before shipping. Start fresh sessions to review AI-touched code.

### Currently Learning
- **LangChain/LangGraph**: chains, retrieval, agents (status: not-started)
- **RAG Systems**: chunking, retrieval pipelines, reranking (status: not-started)
- **Vector Databases**: embeddings, similarity search, indexing (status: not-started)
- **Pydantic**: validation, discriminated unions, settings (status: not-started)
- **AI Evals**: LangSmith, accuracy/latency metrics (status: not-started)

### Deepening
- **FastAPI**: dependency injection, middleware, async patterns (status: familiar)
- **MCP Servers**: protocol, tool definition, server architecture (status: exploring)

### Strong Skills
- React / React Native, TypeScript, Python, Django, C#/.NET
- REST API design, SQL/database design, Git workflows
```

</details>

<details>
<summary><strong>Example: Junior developer out of bootcamp</strong></summary>

```markdown
## Developer Profile

### About Me
Junior developer, recent bootcamp graduate. Comfortable building basic
full-stack apps with guided tutorials but still developing confidence
working independently on larger projects. I want to understand patterns
and best practices, not just get code that works.

### Tech Stack
- **Languages:** JavaScript, Python (learning)
- **Frontend:** React (basics), HTML/CSS
- **Backend:** Express.js
- **Data:** PostgreSQL (basics), MongoDB (basics)
- **DevOps:** Git (basics)

### Development Philosophy
- I want to understand what I build, not just copy-paste solutions.
- Ask questions before guessing. Better to learn the right way first.

### Currently Learning
- **React**: hooks, state management, component patterns (status: in-progress)
- **REST API design**: routes, status codes, auth patterns (status: in-progress)
- **SQL**: joins, schema design, migrations (status: in-progress)
- **Python**: core language, data structures (status: not-started)
- **Git workflows**: branching, merging, PRs (status: in-progress)
- **Testing**: what to test, how to write tests, pytest/Jest (status: not-started)

### Deepening
- **JavaScript**: closures, async/await, array methods (status: familiar)
- **HTML/CSS**: responsive design, Flexbox, Grid (status: familiar)

### Strong Skills
- Basic terminal/command line usage
- Reading documentation
- Debugging with console.log and browser dev tools
```

</details>

The junior's "Currently Learning" is full of things the senior has in "Strong Skills." That's the point. `/pair-program` gives the junior deep, foundational explanations for React hooks and SQL joins. The same command breezes past those topics for the senior and focuses understanding checks on LangChain and RAG instead.

## License

MIT
