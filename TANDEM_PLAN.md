# Tandem

## For the Implementer (Claude Code)

This document is the complete specification for building Tandem, a suite of Claude Code commands that guide developers through the full lifecycle of building software. Your job is to write the command files based on the specs in this document.

### Before you start

1. **Use Context7 MCP to look up Claude Code documentation.** Search for best practices on creating custom commands, the `.claude/commands/` format, how commands are loaded and invoked, and any conventions for writing effective command prompts. The documentation is the authority on how Claude Code commands work. This plan tells you *what* each command should do; the Claude Code docs tell you *how* to structure the files so they work correctly.

2. **Read the build order** (near the bottom of this document). Build in that order. Start with `pair-program`, then `create-manifest`, then `create-prd`, and so on.

3. **Read the original pair-program skill** (attached as a separate file or pasted below). This is the assessment-specific version that worked well in practice. Your first task is to generalize it based on the spec in this document.

### What this plan covers

- **Skill specs** (sections 1-8 under "Skill Specifications"): What each command does, its trigger, workflow, templates, design notes, and resolved questions. This is the meat of the document.
- **Project manifest** (`tandem.json`): The structure, fields, examples, and how each skill uses it.
- **Installation and distribution**: File structure, npm publishing, what the installer does.
- **Developer Profile template**: The optional `~/.claude/CLAUDE.md` section and how skills use it.
- **Design principles, workflows, and resolved decisions**: Context for why things are the way they are.

### What this plan does NOT cover

- **The actual command file content.** This plan specs out what each command should do. You need to write the markdown prompt text for each `.claude/commands/*.md` file based on these specs.
- **The installer script.** `bin/tandem.js` needs to be written. The spec describes what it does (copy commands, create template directory) but doesn't include the code.
- **The README.** The plan includes the pitch, collapsible structure decisions, and content guidelines. You write the actual README.

### Command file format

Each command is a plain markdown file in `.claude/commands/`. No YAML frontmatter needed (that's for SKILL.md files, which are a different format). The file name determines the slash command: `pair-program.md` is invoked with `/pair-program`. The content is the prompt instructions that Claude Code reads when the command is invoked.

### Key conventions

- Never use em dashes in any written content. Use commas, periods, colons, or semicolons instead.
- The plan uses `dev-docs/` as the default directory for greenfield doc creation, but the manifest (`tandem.json`) is the actual source of truth for where docs live.

---

## The Problem

AI coding agents (Claude Code, Cursor, Codex) make developers faster. But speed creates a trap: the faster you ship, the less you understand what you shipped. Developers find themselves staring at code they can't explain, making architectural decisions they can't defend, and building on foundations they don't fully grasp. The industry is splitting into two camps: developers who resist AI tools to preserve understanding, and developers who embrace AI tools and quietly lose it.

**This suite exists so developers don't have to choose.** Ownership and speed. Understanding and velocity. Every skill in this suite is designed around a single idea: a more experienced developer sitting next to you, helping you get things done fast while making sure you actually learn along the way.

This is experience-agnostic. A junior developer gets deeper foundational context. A senior developer gets peer-level discussion of trade-offs. A staff engineer gets a second brain for architectural decisions. The skills adapt. But at every level, the workflow is the same: explain, build, verify understanding, move on.

This will be published as a GitHub repo that anyone can install and use.

---

## Design Principles

1. **Ownership and speed, not ownership or speed.** This is the core principle. Every other principle serves this one. The workflow is structured so that developers understand what they build, can explain their decisions, and still move fast. AI generates code; the developer owns it.
2. **Experience-agnostic.** A junior, mid-level, senior, or staff engineer should all benefit from this suite. The skills always act as a "more experienced" version of whatever the developer is. Explanations calibrate to the developer's level. Understanding checks meet them where they are. Nobody gets talked down to; nobody gets left behind.
3. **Lightweight over comprehensive.** These skills should feel like a helpful colleague sitting next to you, not a compliance framework. Minimal documentation overhead. No files that grow unbounded and eat context.
4. **Works without setup, better with it.** Every skill works out of the box with zero configuration. If the developer has a Developer Profile section in their `~/.claude/CLAUDE.md`, the skills use it to personalize the experience (learning-aware questions, stack preferences, calibrated explanation depth). If not, everything still works.
5. **Adapts to project type.** Greenfield projects get the full workflow. Brownfield/bluefield projects skip straight to implementation. The skills detect what documentation exists and adjust.
6. **No unbounded files.** No learning journals or files that grow indefinitely. They eat context on every reread and nobody goes back to read them. If a file grows, it should be a conscious decision by the developer (like ADRs, which are separate files by design).
7. **Shareable and installable.** The repo should be installable with minimal friction. A developer clones it, drops it in place, and starts using it. The optional `~/.claude/CLAUDE.md` template is a recommendation, not a requirement.

---

## Project Manifest (`tandem.json`)

Every Tandem project has a `tandem.json` file in the project root. This is the table of contents for all project documentation: what docs exist, what they cover, and where they live. It's universal: greenfield and brownfield projects both use it.

**For greenfield projects,** Tandem's creation skills (`create-prd`, `create-architecture`, etc.) automatically register their output in the manifest as they create docs. The manifest starts empty and grows as the project grows.

**For brownfield projects,** the team fills in the manifest to map their existing docs. Docs can be anywhere in the repo, named anything, organized any way. The manifest is how Tandem finds them.

**If no manifest exists,** `pair-program` suggests running `/create-manifest` to scan the repo and generate one. The developer can also create `tandem.json` manually using the template in `.tandem/templates/`.

### Structure

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
      "purpose": "Product requirements, target users, tech stack decisions, project scope",
      "tags": ["prd", "requirements", "scope", "stack"]
    },
    {
      "path": "dev-docs/ARCHITECTURE.md",
      "scope": "general",
      "purpose": "System design, component breakdown, data model, API design, project conventions",
      "tags": ["architecture", "system-design", "conventions", "data-model"]
    },
    {
      "path": "dev-docs/ROADMAP.md",
      "scope": "general",
      "purpose": "Ordered implementation steps with checkboxes and user stories",
      "tags": ["roadmap", "planning"]
    },
    {
      "path": "dev-docs/adrs/",
      "scope": "general",
      "purpose": "Architecture decision records",
      "tags": ["adr", "decisions"]
    }
  ]
}
```

### Fields

**`config`**: Project-level settings for Tandem skill behavior. All fields are optional and default to sensible values if omitted.

- **`understandingChecks`** (default: `true`): When `true`, `pair-program` asks three understanding check questions after each sub-step. Set to `false` to skip them entirely. The developer can toggle this in the JSON file at any time without having to tell the agent to skip questions repeatedly. Since `pair-program` already reads this file on startup, this adds zero additional token cost.

**`path`**: Where the file or directory lives, relative to project root.

**`scope`**: Which domain this doc covers. Used by `pair-program` to filter docs by relevance to the current task. Common values: `general` (applies to everything), `frontend`, `backend`, `database`, `api`, `infrastructure`. Teams can use any values they want.

**`purpose`**: A human-readable description of what the doc contains. This is what `pair-program` reads to decide relevance *without* opening the file. If the purpose doesn't sound relevant to the current task, the file never gets loaded into context.

**`tags`**: Finer-grained matching keywords. A task about "fix the error handling in the payments endpoint" would match on `api`, `backend`, `error-handling`. Tags are flexible and team-defined. Conventional tags that Tandem skills search for: `prd`, `architecture`, `roadmap`, `adr`, `conventions`.

### How skills use the manifest

- **`create-manifest`**: Creates the manifest. In scan mode, scans the repo for documentation files and builds the manifest with developer review. In initialize mode, creates a minimal manifest with default config and empty docs array. Can also update an existing manifest by scanning for new docs.
- **`pair-program`**: Reads the manifest on startup. Matches the current task against `scope`, `purpose`, and `tags` to load only relevant docs. "Fix the pagination endpoint" loads backend and database docs, skips frontend docs. If the developer says "also check the frontend docs," loads those on demand.
- **`update-docs`**: Scans the docs array to find files affected by a change (matching by scope, purpose, and tags). Reads each file as it actually is, makes changes within its existing structure, and preserves everything it didn't change. Does not impose Tandem templates on existing docs.
- **`create-adr`**: Finds the entry tagged `adr` to know where to write the new ADR file.
- **`pair-program` (marking complete)**: Finds the entry tagged `roadmap` to know which file has the checkboxes.
- **Creation skills**: After creating a new doc (`create-prd`, `create-architecture`, `create-roadmap`), register it in the manifest automatically.

### Brownfield example

A team that already has docs scattered across their repo might have a manifest like this:

```json
{
  "version": 1,
  "config": {
    "understandingChecks": true
  },
  "docs": [
    {
      "path": "wiki/system-architecture.md",
      "scope": "general",
      "purpose": "High-level architecture, service map, deployment topology",
      "tags": ["architecture", "system-design"]
    },
    {
      "path": "docs/frontend/react-patterns.md",
      "scope": "frontend",
      "purpose": "Component architecture, hooks patterns, state management conventions",
      "tags": ["frontend", "react", "conventions"]
    },
    {
      "path": "docs/frontend/styling-guide.md",
      "scope": "frontend",
      "purpose": "Tailwind usage rules, design tokens, responsive breakpoints",
      "tags": ["frontend", "styling", "conventions"]
    },
    {
      "path": "docs/api/rest-standards.md",
      "scope": "backend",
      "purpose": "Endpoint naming, status codes, error response format, auth patterns",
      "tags": ["api", "backend", "conventions"]
    },
    {
      "path": "docs/database/schema.md",
      "scope": "database",
      "purpose": "Table definitions, relationships, indexing strategy, migration conventions",
      "tags": ["database", "schema", "data-model"]
    },
    {
      "path": "docs/decisions/",
      "scope": "general",
      "purpose": "Architecture decision records",
      "tags": ["adr", "decisions"]
    },
    {
      "path": ".claude/rules/naming-conventions/",
      "scope": "general",
      "purpose": "Naming conventions for files, variables, components, and API endpoints",
      "tags": ["conventions", "naming"]
    },
    {
      "path": "CONTRIBUTING.md",
      "scope": "general",
      "purpose": "PR process, branch naming, commit conventions, review expectations",
      "tags": ["conventions", "workflow"]
    }
  ]
}
```

No PRD, no roadmap, no Tandem-template docs. Just the team's existing documentation, indexed for Tandem to use.

### Key principles

- **The manifest is a table of contents, not a format enforcer.** It tells Tandem where docs are and what they're about. It says nothing about how they're structured inside.
- **Creation skills are opinionated. Update skills are respectful.** `create-architecture` outputs Tandem's template when generating a new doc. `update-docs` reads any doc as-is, preserves its structure, and changes only what was requested. A team's pre-existing architecture doc that doesn't match Tandem's template gets the same quality treatment.
- **Token-efficient.** `pair-program` loads only docs relevant to the current task. The manifest is small enough to read on every startup; the actual docs are loaded selectively.

### Default doc directory

For greenfield projects where Tandem creates the docs, `dev-docs/` is the default output directory. This is a convention, not a requirement. The manifest tracks where files actually live regardless of directory structure.

```
project-root/
  tandem.json
  dev-docs/
    PRD.md
    ARCHITECTURE.md
    ROADMAP.md
    adrs/
      001-chose-fastapi-over-flask.md
      002-switched-to-postgresql.md
```

---

## Skills Overview

### The Suite (7 skills + 1 optional)

| Skill | Purpose | Project Types |
|---|---|---|
| `create-manifest` | Generate or update the `tandem.json` project manifest | All |
| `create-prd` | Generate a PRD from a project idea | Greenfield |
| `create-architecture` | Generate or reverse-engineer a technical architecture doc | All |
| `create-roadmap` | Generate an ordered implementation plan from PRD | Greenfield |
| `create-issues` | (Optional) Convert roadmap steps into GitHub issues | Greenfield |
| `pair-program` | Guided implementation with understanding checks | All |
| `update-docs` | Update all relevant documents when a decision changes | All |
| `create-adr` | Record an architecture decision | All |

---

## Workflows

### Greenfield (new project, starting from scratch)

```
create-prd (automatically creates tandem.json manifest)
    |
    v
create-architecture
    |
    v
create-roadmap
    |
    v
create-issues (optional)
    |
    v
pair-program (repeat per roadmap step, issue, or ad hoc task)
    |
    v
update-docs / create-adr (as decisions change during implementation)
```

For greenfield, the manifest is created automatically by the first creation skill (`create-prd`). Each subsequent skill registers its output in the manifest. No need to run `create-manifest` separately unless you want to add additional docs later.

### Brownfield / Bluefield (existing codebase)

```
create-manifest (scan repo, map existing docs to tandem.json)
    |
    v
create-architecture (optional, recommended when inheriting an unfamiliar codebase)
    |
    v
pair-program (with task description or issue from existing repo)
    |
    v
create-adr (for significant architectural decisions)
    |
    v
update-docs (if existing docs need to reflect changes)
```

For brownfield/bluefield, `create-manifest` is the natural entry point. It scans the repo for documentation files and builds the `tandem.json` manifest so that `pair-program` and other skills know what docs exist and where they live.

`create-architecture` serves a different purpose than in greenfield. Instead of designing a system, it reverse-engineers one. It scans the existing codebase and produces an architecture doc that helps the developer build a mental model of how everything fits together. This is especially valuable when inheriting a codebase you need to learn quickly.

Bluefield projects can also use `create-architecture` to document the target state alongside the current state, making it a migration planning tool.

---

## Skill Specifications

### 1. `create-manifest`

**Trigger:** User says "create a manifest," "set up tandem," "map my docs," "initialize tandem," "scan for docs," or similar. Also triggered as a suggestion by `pair-program` when no `tandem.json` exists.

**Works in two modes:**

**Mode 1: Scan (brownfield/bluefield).** The project already has documentation files. The skill scans the repo for common doc patterns (markdown files in `docs/`, `wiki/`, `.claude/rules/`, project root, etc.), identifies what each file is about, and builds the manifest. The developer reviews and refines before the manifest is written.

**Mode 2: Initialize (greenfield).** The project is new and has no docs yet. The skill creates a minimal `tandem.json` with default config and an empty `docs` array. Subsequent creation skills (`create-prd`, `create-architecture`, etc.) register their output as they create docs.

**Workflow:**

1. **Detect mode.** Is there an existing codebase with documentation files? If yes, scan mode. If the project is empty or brand new, initialize mode.
2. **Scan mode:**
   a. Scan the repo for documentation files. Look for markdown files, READMEs, docs directories, wiki directories, rule files, config docs, ADR directories, and any other structured documentation.
   b. For each file found, infer `scope`, `purpose`, and `tags` from the filename, directory, and a quick read of the content (first few lines or headings).
   c. Present the draft manifest to the developer for review. "I found these docs in your repo. Here's how I'd categorize them. Want to adjust anything?"
   d. Revise based on feedback.
3. **Write `tandem.json`** to the project root.
4. **Initialize mode:** Create `tandem.json` with default config and empty docs array. Done.

**Default manifest (initialize mode):**

```json
{
  "version": 1,
  "config": {
    "understandingChecks": true
  },
  "docs": []
}
```

**Design notes:**
- The scan is best-effort. It won't catch everything, and it may miscategorize some files. That's why the developer reviews before the manifest is written.
- The skill should be conservative about what it includes. A `node_modules/` README or a `LICENSE` file shouldn't end up in the manifest. Focus on files that a developer would actually want the AI to read for context.
- For large repos with many docs, the skill should prioritize: architecture docs, API docs, convention/style guides, ADRs, READMEs, and contribution guides. It can ask the developer: "I found 47 markdown files. Want me to include all of them, or should I focus on the most important ones?"
- The developer can always edit `tandem.json` manually. This skill is a convenience, not a requirement.
- Running `create-manifest` on a project that already has a `tandem.json` should offer to update it (scan for new docs that aren't in the manifest yet) rather than overwrite it.

---

### 2. `pair-program` (the core skill)

**Trigger:** User says "pair-program," "let's pair on," "help me work through," "let's implement," or references pair programming in any casual way.

**Context loading:** On startup, read `tandem.json` to understand what docs exist. Match the current task against `scope`, `purpose`, and `tags` to load only relevant docs into context. If a doc tagged `conventions` or `architecture` includes project conventions, reference those on every sub-step to ensure generated code follows the project's standards (testing, code style, error handling, development philosophy, etc.). If no `tandem.json` exists, suggest running `/create-manifest` to scan the repo and generate one. If the developer declines, work from the codebase and conversation alone.

**Also reads (if present):** The developer's `~/.claude/CLAUDE.md` for their Developer Profile section, which includes skills, learning goals, experience level, and development philosophy. This personalizes the depth of explanations and understanding checks. A junior developer gets more foundational context ("here's what a middleware is and why we need one"). A senior developer gets peer-level trade-off discussion ("here's why I'd pick this middleware pattern over that one"). If the profile isn't present, the skill defaults to thorough explanations and adjusts based on conversational cues.

**Philosophy precedence:** Development philosophy can live in two places: the developer's global Developer Profile (`~/.claude/CLAUDE.md`) and the project's conventions (in whichever doc is tagged `conventions` or contains a development philosophy section). If both exist, the project-level philosophy takes precedence for this project. If only the global profile exists, use that. If neither exists, use sensible defaults. This allows a developer to have a personal default ("AI generates code, humans own it") while a specific project overrides it ("this is a client handoff; prioritize comprehensive inline documentation over speed").

**Core workflow loop:**

1. **Understand the request.** User provides a roadmap step, issue number/link, feature description, or bug report. If the user references a GitHub issue number (e.g., "let's work on #12"), pull the issue context via GitHub CLI (`gh issue view`) to get the description, user stories, acceptance criteria, and roadmap reference. Cross-reference with the doc tagged `roadmap` in the manifest if linked. If there are discrepancies between the issue and the roadmap, flag them before proceeding. Confirm back what you'll be working on.
2. **Break into sub-steps.** Decompose into small, focused pieces (one function, one endpoint, one component). Present the full plan, then start with sub-step 1.
3. **Explain the sub-step.** What you're building, why this approach, how it works conceptually. The tone is always "a more experienced developer walking you through their thought process." Not lecturing, not dumbing down. Explaining the reasoning so the developer could make similar decisions independently.
4. **Ask who implements.** "Would you like to implement this, or should I?" If user implements: review and guide. If Claude implements: write code and walk through decisions.
5. **Check understanding (if enabled).** If `config.understandingChecks` is `true` (the default) in `tandem.json`, ask three questions after each sub-step. Mix of technical, conceptual, and "how would you explain this decision" style questions. Calibrate to the developer's level: a junior might get "what does this function return and why?", a senior might get "what are the trade-offs of this approach vs. the alternative?" If `~/.claude/CLAUDE.md` has learning goals, weight questions toward topics the developer is actively learning. If `understandingChecks` is `false`, skip this step entirely and move straight to the next sub-step.
6. **Move to next sub-step.** Repeat until the task is complete.
7. **Complete the step.** Summarize what was built, decisions made, things to keep in mind.
8. **Mark complete (if applicable).** If the task was a roadmap step, find the doc tagged `roadmap` in the manifest and update the checkbox from `- [ ]` to `- [x]`. If it was a GitHub issue, offer to close the issue via `gh issue close`.

**Key design decisions:**
- No hardcoded doc paths. Uses `tandem.json` manifest to discover and load docs.
- No context-specific assumptions (no line caps, no interview framing). The skill adapts to whatever the developer is building and why.
- No learning journal. Understanding checks happen in conversation only. No files that grow unbounded.
- Works with or without a roadmap. For brownfield, the user just describes what they want to do.
- Experience-agnostic. Calibrates to the developer's level via Developer Profile or conversational cues. A junior building their first API and a staff engineer refactoring a distributed system both get useful guidance.
- Optionally personalizes to developer's learning goals via `~/.claude/CLAUDE.md`.
- **GitHub issue integration (optional).** If the developer references an issue number and GitHub CLI is available, the skill pulls issue context automatically. If `gh` isn't installed, the skill still works; the developer just provides the context manually. This is a graceful degradation, not a hard dependency for the core skill.

**Resolved questions:**
- [x] ~~Understanding checks skippable?~~ **Yes.** Two ways: set `config.understandingChecks` to `false` in `tandem.json` to turn them off project-wide, or say "skip questions" in conversation for a one-time skip.
- [x] ~~Run tests after each sub-step?~~ **Yes.** Offers to run tests when a test framework is detected.
- [x] ~~Multi-file sub-steps?~~ **Handled naturally.** The skill decomposes work into focused pieces. No special handling needed.
- [x] ~~Pull context from GitHub issues?~~ **Yes.** If the developer references an issue number and `gh` is available, the skill pulls the issue context. Graceful degradation if `gh` isn't installed.

---

### 3. `create-prd`

**Trigger:** User says "create a PRD," "write a PRD," "I have a project idea," "help me plan a new project," or similar.

**Recommended mode:** This skill works best when Claude Code is in **plan mode** (`/plan`). The PRD creation process is inherently conversational: gathering requirements, discussing trade-offs, exploring scope. Plan mode keeps Claude in a discussion posture rather than jumping to write files prematurely. The skill should suggest switching to plan mode at the start if the developer isn't already in it.

**Workflow:**

1. **Gather context.** Ask clarifying questions: What's the problem? Who are the users? What are the constraints? Is there a preferred tech stack, or is that open for discussion?
2. **Read `~/.claude/CLAUDE.md` (if present).** Use the developer's experience level to calibrate the depth of questions and discussion. **Do NOT** use the developer's existing tech stack or learning goals to influence tool/language recommendations. The right stack for the project is whatever best solves the problem, not whatever the developer already knows or wants to learn.
3. **Discuss tech stack as a collaborative decision.** If the developer has preferences, respect them. If they ask for guidance, recommend tools based on the project's needs, trade-offs, and constraints. Present options and let the developer decide.
4. **Draft the PRD.** Write to `dev-docs/PRD.md` (or wherever the developer specifies).
5. **Register in manifest.** Add the new doc to `tandem.json` (create the file if it doesn't exist).
6. **Review with user.** Walk through the draft, get feedback, revise.

**PRD structure (flexible template):**

The following sections are a starting point, not a rigid format. Adapt based on the project. A simple CLI tool doesn't need a Target Users section. A complex distributed system might need additional sections for data flow or security. Use judgment.

```markdown
<!-- Last updated: [date] -->
<!-- Last change: Initial PRD creation -->

# [Project Name] - Product Requirements Document

## Problem Statement
## Target Users (if applicable)
## Core Requirements
## Technical Stack
  ### Stack Decisions (with brief rationale for each)
## Scope
  ### In Scope (v1)
  ### Out of Scope (future)
## Success Criteria
## Learning Goals (optional, for personal/portfolio projects only)
```

**Design notes:**
- Keep it concise. A PRD that takes 30 minutes to read is too long.
- The PRD is a living document. `update-docs` can modify it later.
- Rationale for tech stack decisions goes here briefly; detailed trade-off analysis goes in ADRs.
- The Learning Goals section is optional. Include it when the developer is building something specifically to learn (a portfolio project, a personal experiment). Leave it out for production work, client projects, or anything where learning is secondary to shipping. If present, `pair-program` uses it to inform understanding checks. It should **never** influence which tools or technologies are chosen for the project.
- **Tech stack neutrality.** The skill should never suggest a tool or language because the developer already knows it or because it appears in their Developer Profile. Recommend what's right for the project. If the developer asks "should I use FastAPI or Django for this?", evaluate based on the project's requirements, not on which one appears in their "Strong Skills" section.

**Resolved questions:**
- [x] ~~Should the PRD include a "Learning Goals" section?~~ **Optional.** Included in the template but only for personal/portfolio projects. Never influences tech stack decisions.
- [x] ~~How opinionated should the template structure be?~~ **Flexible.** The template is a starting point. Sections are added, removed, or adapted based on the project type.

---

### 4. `create-architecture`

**Trigger:** User says "create an architecture doc," "document the architecture," "help me design the system," "help me understand this codebase," "map out how this project works," or similar. Also trigger when user references inheriting, onboarding onto, or learning an existing codebase.

**Recommended mode:** Like `create-prd`, this skill works best in **plan mode** (`/plan`) for design and migration modes, where the process is conversational. For reverse-engineer mode, default mode is fine since the skill is primarily scanning and documenting rather than making collaborative decisions.

**Works in three modes:**

**Mode 1: Design (greenfield).** The developer has a PRD and needs to design a system. The skill reads the PRD (found via manifest) and produces an architecture doc that describes how to build it. Note: the Codebase Map and Entry Points sections (described below) are not included at initial creation since there's no code yet. They can be added later via `update-docs` once development is underway.

**Mode 2: Reverse-engineer (brownfield).** The developer has an existing codebase they need to understand. Maybe they just joined a team, inherited a project, or are picking up an open-source repo to contribute to. The skill scans the codebase structure, reads key files (entry points, config, routes, models, package manifests), and produces an architecture doc that maps out how the system actually works. This is the "give me a mental model of this codebase" mode.

**Mode 3: Migration plan (bluefield).** The developer has an existing codebase that needs to evolve toward a new architecture. The skill documents both the current state (reverse-engineered from the codebase) and the target state (from the developer's description or PRD), creating a document that serves as a migration roadmap.

**Workflow:**

1. **Detect mode.** Check `tandem.json` for a doc tagged `prd`. Is there an existing codebase with code in it? Ask the developer if ambiguous: "Are we designing something new, mapping an existing system, or planning a migration?"
2. **Gather context.** For design mode: read the PRD (found via manifest). For reverse-engineer mode: scan the codebase (directory structure, entry points, config files, key modules, package dependencies, README). For migration mode: do both.
3. **Draft the architecture doc** (default: `dev-docs/ARCHITECTURE.md`, or wherever the developer specifies).
4. **Register in manifest.** Add the new doc to `tandem.json`.
5. **Review with user.** Walk through the doc, get feedback, revise. For reverse-engineer mode, this is especially important: the developer can correct misunderstandings about how the system actually works.

**Architecture doc structure (template):**

```markdown
<!-- Last updated: [date] -->
<!-- Last change: Initial architecture document -->

# [Project Name] - Technical Architecture

## System Overview
  (high-level description + Mermaid system diagram showing major
  components and how they communicate)

## Codebase Map (added after development begins, or in reverse-engineer/migration modes)
  (annotated directory structure: what each directory and key file is
  responsible for. The "where do I find things" section.)

## Entry Points (added after development begins, or in reverse-engineer/migration modes)
  (how the app starts, what gets called first, where the request
  lifecycle begins)

## Component Breakdown
  (each component, its responsibility, how it communicates with others)

## Data Model
  (full schema: tables/collections, columns/fields with types,
  relationships, constraints, indexes. Include a Mermaid ERD.)

## API Design
  (endpoints overview, patterns, auth approach)

## Infrastructure & Deployment
  (hosting, CI/CD, environments)

## Key Technical Decisions
  (brief summary; detailed rationale lives in ADRs)

## Project Conventions (optional)
  (cross-cutting rules for how code is written in this project)
  ### Development Philosophy (if different from or supplementing Developer Profile)
    (project-specific principles for how development should be approached.
    Overrides or extends the developer's global philosophy from their
    Developer Profile. E.g., "this is a strict TDD project: write tests
    before implementation" or "prioritize shipping speed; skip understanding
    checks on routine tasks")
  ### Testing
    (strategy, framework, what gets tested, coverage expectations)
  ### Code Style
    (type hints, import style, naming conventions, patterns to prefer/avoid)
  ### Error Handling
    (structured responses, logging, what never to swallow silently)
  ### Commits & PRs
    (conventional commits, PR requirements, review process)
  ### AI Rules
    (any rules specific to how AI agents should behave in this codebase)
```

The Project Conventions section is optional. If present, `pair-program` references it on every sub-step to ensure generated code follows the project's standards. It should stay short: if it doesn't fit on one page, something belongs in a different doc.

**Diagrams:**
- **System Overview** always includes a Mermaid diagram showing the high-level architecture: major components (frontend, backend, database, external services) and how they connect.
- **Data Model** includes a Mermaid ERD showing the full schema: entities, attributes with types, and relationships. This should reflect the actual database schema, not just a conceptual model.
- Diagrams are generated in Mermaid syntax so they render in GitHub, VS Code, and most Markdown viewers without additional tooling.

**Codebase Map and Entry Points:**
- In **reverse-engineer** and **migration** modes, these sections are included from the start since there's an existing codebase to document.
- In **design** mode, these sections are **not** included at initial creation (there's no code yet). Once development is underway, the developer can run `update-docs` to add them. This turns the architecture doc from a design document into a living reference that stays useful throughout the project.

**Additions for migration mode:**
- "Current State" and "Target State" sections for each component that's changing.
- A "Migration Path" section: what changes in what order.

**Unanswered Questions section (reverse-engineer and migration modes only):**
- If the skill encounters things it can't determine from the code alone (e.g., why a particular pattern was chosen, what a cryptic config value does, whether a piece of code is still in use), it adds a brief "Unanswered Questions" section at the bottom.
- Keep this minimal. Only include questions where the answer materially affects the developer's ability to work in the codebase. Don't pad it with speculation.
- This section is temporary: as the developer learns more, they or `update-docs` can resolve and remove the questions.

**Adaptive scan depth (reverse-engineer and migration modes):**
- The skill should adapt how deeply it scans based on the size of the codebase.
- **Small projects** (roughly <20 files or a few thousand lines): scan into individual files. Read route handlers, model definitions, key utility functions. The full picture fits in context.
- **Medium projects** (roughly 20-100 files): scan directory structure fully, read entry points and config files in full, read key files (models, routes, main modules) but summarize rather than reproduce. Skim utility files and tests for patterns rather than reading line by line.
- **Large projects** (100+ files): start with directory structure and package manifests only. Read entry points, config, and README. Identify the major modules/packages and read their top-level files. Go deeper only into areas the developer specifically asks about.
- When in doubt, start broad and ask the developer: "This is a large codebase. Want me to go deeper into any specific area?"
- The goal is always a useful mental model, not an exhaustive catalog. A Codebase Map that's 10 pages long is worse than one that's 1 page with the right information.

**Resolved questions:**
- [x] ~~Auto-generate Mermaid diagrams?~~ **Yes.** System Overview gets a Mermaid system diagram. Data Model gets a Mermaid ERD. Both render natively in GitHub and VS Code.
- [x] ~~How deep should the data model section go?~~ **Full schema.** Tables, columns with types, relationships, constraints, indexes. Accompanied by a Mermaid ERD.
- [x] ~~How deep should the codebase scan go?~~ **Adaptive.** Scales with project size: small projects get file-level depth, large projects get module-level with the option to drill down on request.
- [x] ~~"Questions I'd Ask the Previous Developer" section?~~ **Yes, but minimal.** Renamed to "Unanswered Questions." Only included in reverse-engineer and migration modes. Only for things that materially affect the developer's ability to work in the codebase. Temporary: resolved and removed over time.

---

### 5. `create-roadmap`

**Trigger:** User says "create a roadmap," "break this into steps," "plan the implementation," or similar.

**Depends on:** A PRD must exist (found via `tandem.json` entry tagged `prd`).

**Workflow:**

1. **Read the PRD and architecture doc (if exists)** by finding them via the manifest.
2. **Break the project into ordered implementation steps.**
3. **Write the roadmap** (default: `dev-docs/ROADMAP.md`, or wherever the developer specifies).
4. **Register in manifest.** Add the new doc to `tandem.json`.
5. **Review with user.**

**Roadmap structure:**

```markdown
<!-- Last updated: [date] -->
<!-- Last change: Initial roadmap creation -->

# [Project Name] - Implementation Roadmap

Generated from: [PRD path from tandem.json]
Last updated: [date]

## Steps

- [ ] **Step 1: [Title]**
  [Brief description of what this step covers and what the deliverable is]
  [Reference to architecture component if applicable, e.g., "Implements
  the API layer from ARCHITECTURE.md"]
  GitHub Issue: [#N, added by create-issues if used]

  **User Stories** (where applicable):
  - As a [user type], I want to [action] so that [outcome].
  - As a [user type], I want to [action] so that [outcome].

- [ ] **Step 2: [Title]**
  [Brief description]

...
```

**Design notes:**
- Steps are ordered by dependency (what has to exist before what).
- Each step should be completable in one `pair-program` session (roughly 1-4 hours of work).
- The checkbox format is what `pair-program` uses to mark steps complete.
- Keep steps minimal. No time estimates or complexity scores. The step title, brief description, and user stories should be enough context for `pair-program` to work from.
- Steps can reference specific architecture components when it adds clarity (e.g., "Implements the data pipeline from ARCHITECTURE.md"), but this isn't required. `pair-program` reads both documents regardless.
- **User stories** are included where applicable. Not every step has them: infrastructure setup, configuration, and refactoring steps often don't map to a user-facing outcome. But for steps that deliver user-visible functionality, user stories ground the work in who it's for and why it matters. They also give `pair-program` better context for understanding checks ("How does this endpoint serve the user story we're implementing?").

**Resolved questions:**
- [x] ~~Include estimated complexity or time?~~ **No.** Keep it minimal.
- [x] ~~Reference specific architecture components?~~ **Yes, when it adds clarity.** Not required since `pair-program` reads both docs anyway.

---

### 6. `create-issues` (Optional)

**Trigger:** User says "create issues," "convert roadmap to issues," "push to GitHub," or similar.

**Depends on:** A roadmap must exist (found via `tandem.json` entry tagged `roadmap`). Project must be a GitHub repo. **Requires the GitHub CLI (`gh`) to be installed and authenticated.**

**Workflow:**

1. **Read the roadmap** by finding it via the manifest.
2. **Convert each roadmap step into a GitHub issue** using the issue template (see below).
3. **Each issue links back to its roadmap step** (e.g., "Roadmap: Step 3 in `[roadmap path from manifest]`").
4. **Create the issues via GitHub CLI (`gh issue create`).**
5. **Update each roadmap step with a link to its issue** (e.g., "GitHub Issue: #12"). This creates a true two-way reference: issues link to roadmap steps, roadmap steps link to issues. When `update-docs` modifies a roadmap step, it can see the linked issue and flag that the GitHub issue may now be out of date.

**Issue template:**

The skill follows this template when creating issues. It's included in the repo so users can modify it to fit their workflow.

```markdown
## Description
[What this step implements, pulled from the roadmap step description]

## User Stories (if applicable)
[Pulled from the roadmap step, if user stories were included]
- As a [user type], I want to [action] so that [outcome].

## Roadmap Reference
Step [N] in `[roadmap path from tandem.json]`

## Acceptance Criteria
- [ ] [Key deliverable or behavior that signals this step is done]
- [ ] [Another criteria if applicable]
```

**Design notes:**
- Issues are for workflow organization, not learning classification. No learning tier labels, no learning goal tags. The `pair-program` skill handles learning-aware guidance during implementation.
- Just issues, not a project board. The developer can create a board and organize issues however they want.
- The issue template ships with the repo at `templates/github-issue-template.md`. Developers can modify it to match their team's conventions.
- Acceptance criteria are derived from the roadmap step's description and user stories. Keep them concrete and verifiable.

**Resolved questions:**
- [x] ~~Create a GitHub Project board?~~ **No.** Just issues. The developer creates their own board if they want one.
- [x] ~~Link issues back to roadmap steps?~~ **Yes.** Every issue includes a "Roadmap Reference" linking to the specific step. Enables `pair-program` to flag discrepancies.
- [x] ~~Should `pair-program` pull context from GitHub issues?~~ **Yes.** See `pair-program` spec. Requires GitHub CLI.

---

### 7. `update-docs`

**Trigger:** User says "update the docs," "the plan changed," "we decided to switch to X," "update the PRD," "update the roadmap," or similar.

**Workflow:**

1. **Understand what changed and why.**
2. **Scan `tandem.json`** to identify affected docs by matching the change against scope, purpose, and tags. Suggest which docs are affected and confirm with the developer.
3. **Check for conflicts** across docs using domain-based authority (see below). If a conflict exists, flag it and confirm with the developer before making changes. Never silently resolve a conflict.
4. **Read each affected doc as it actually is.** Understand its current structure, headings, format. Make changes within that structure. Don't impose Tandem templates on existing docs. Don't add sections that aren't there. Don't expect a version header if there isn't one. Preserve everything you didn't change. If the doc was created by Tandem and has a version header, update it.
5. **Optionally create an ADR** for significant architectural changes (prompt the user: "This seems like a significant decision. Want me to create an ADR for it?").

**Version header:**

Docs created by Tandem's creation skills include a lightweight version header at the top. Not a changelog, not a growing list. Just a snapshot of when the doc was last touched and what the last significant change was. Overwritten on each update, not appended. Pre-existing team docs that don't have a version header don't get one forced on them.

```markdown
<!-- Last updated: 2026-03-18 -->
<!-- Last change: Removed WebSocket requirement; switched to polling (see ADR-003) -->
```

Two lines. Always current. If someone wants the full history, that's what git is for. If someone needs to know "is this doc stale and what changed last," the header answers that instantly. The ADR reference is the breadcrumb if they want the full story.

The `create-prd`, `create-architecture`, and `create-roadmap` skills should include this header when they first generate their docs. `update-docs` updates it on every modification.

**Domain-based authority (conflict resolution):**

When docs conflict, the resolution depends on which domain the conflict falls in. This isn't a simple hierarchy where one doc always wins. Each doc is authoritative over a different concern:

| Domain | Authoritative doc | Examples |
|---|---|---|
| **What to build and why** | PRD | Requirements, scope, user needs, success criteria. "Users need to upload files" is a requirement. The PRD decides this. |
| **How to build it** | Architecture | System design, component structure, data model, conventions, technical decisions. "Use dependency injection for all services" is an architectural choice. The architecture doc decides this. |
| **What order to build it** | Roadmap | Execution plan, step sequencing, dependencies. Derived from both PRD and architecture. |
| **Why a specific technical choice was made** | ADRs | Trade-off analysis, alternatives considered, decision rationale. ADRs are the historical record. |

A real conflict happens when domains clash: the PRD requires something the architecture can't support (e.g., PRD says "real-time collaboration" but the architecture describes a stateless request-response pattern). In that case, the *requirement* stands and the *architecture* needs to evolve to meet it. But the architecture doc decides *how* to evolve.

In all cases: **flag the conflict, explain which domain each side falls in, and confirm with the developer before changing anything.**

**Design notes:**
- One skill, not separate "update-prd" / "update-roadmap" skills. The trigger is always "something changed."
- Updates should be visible. Don't silently rewrite. The version header captures the latest change, and the developer can see exactly what was modified in the diff.
- If a roadmap step is invalidated by a change, mark it clearly (strikethrough or note) rather than deleting it.
- **GitHub issue sync.** If a roadmap step has a linked GitHub issue (e.g., "GitHub Issue: #12") and the step is modified, flag that the corresponding issue may now be out of date. Prompt the developer: "Step 3 changed and it's linked to issue #12. Want me to update the issue description to match?" If `gh` is available, update the issue via `gh issue edit`. If not, note which issues need manual updating.
- **Architecture enrichment.** For greenfield projects, the initial architecture doc won't have Codebase Map or Entry Points sections (there's no code yet). Once development is underway, running `update-docs` on the architecture doc should add these sections by scanning the now-existing codebase. This turns the architecture doc from a design document into a living reference. The developer can ask for this explicitly ("update the architecture doc with a codebase map") or the skill can suggest it when it notices significant implementation has occurred since the architecture doc was created.

**Resolved questions:**
- [x] ~~Changelog sections or git history?~~ **Neither.** Lightweight version header at the top of each doc (two lines: last updated date, last change summary). Overwritten on each update, not appended. Git history is the full record. ADRs are the breadcrumb for significant decisions.
- [x] ~~How to handle conflicting changes?~~ **Domain-based authority.** PRD owns what/why, architecture owns how, roadmap owns order, ADRs own decision rationale. When domains clash, the requirement stands and the implementation evolves. Always flag and confirm with the developer.

---

### 8. `create-adr`

**Trigger:** User says "create an ADR," "record this decision," "document why we chose X," or similar. Also triggered as a suggestion from `update-docs` when a significant change is detected.

**Workflow:**

1. **Gather the decision context** from the user (or from `update-docs` handoff).
2. **Find the ADR directory** via `tandem.json` (entry tagged `adr`). Auto-number by scanning existing files.
3. **Write the ADR** using a concise template.
4. **Update the architecture doc** (found via manifest, entry tagged `architecture`) key decisions section to reference the new ADR. If no architecture doc exists, skip this step.

**ADR template:**

```markdown
# ADR-[NNN]: [Decision Title]

**Date:** [date]
**Status:** Accepted

## Context
[What situation or problem prompted this decision?]

## Decision
[What did you decide?]

## Alternatives Considered
[What other options were evaluated and why were they rejected?]

## Consequences
[What are the implications of this decision, both positive and negative?]
```

**Design notes:**
- Keep ADRs short. If it takes more than 10 minutes to write, it's too long.
- ADRs are immutable once accepted. If a decision is reversed, write a new ADR that supersedes the old one (don't edit the original).
- The ADR directory (found via manifest entry tagged `adr`) is created on first use. Default: `dev-docs/adrs/`.

---

## Optional: `~/.claude/CLAUDE.md` Developer Profile

Several skills in the suite personalize their behavior if the developer has a `## Developer Profile` section in their global `~/.claude/CLAUDE.md`. This is entirely optional: every skill works without it. But with it, explanations are calibrated to your level, understanding checks focus on what you're actually learning, and tech stack suggestions align with your preferences.

### What the skills need vs. what they don't

Your `~/.claude/CLAUDE.md` probably contains a lot of stuff: project-specific instructions, formatting preferences, career goals, personal notes. The skills in this suite only look for the `## Developer Profile` section. Everything else in your CLAUDE.md is ignored by these skills (though Claude Code still reads it all normally).

**Useful for the workflow:** experience level, tech stack, skill tiers, learning goals, development philosophy.

**Not used by the workflow (keep elsewhere in your CLAUDE.md if you want):** salary targets, career strategy, LinkedIn goals, target companies, writing style preferences, portfolio strategy.

### Recommended template

Add this section to your `~/.claude/CLAUDE.md`. The three skill tiers (Currently Learning, Deepening, Strong Skills) are what drive `pair-program` understanding check depth and help `create-roadmap` order steps intelligently.

```markdown
## Developer Profile

### About Me
[1-3 sentences. Who you are, your experience level, what you're building toward.
This helps the skills calibrate tone: a senior engineer gets peer-level explanations,
a junior gets more foundational context.]

### Tech Stack
[What you work with regularly. Helps create-prd suggest appropriate tools
and create-architecture make relevant design choices.]
- **Languages:** [e.g., Python, TypeScript, C#]
- **Frontend:** [e.g., React, React Native/Expo]
- **Backend:** [e.g., FastAPI, Django, .NET]
- **Data:** [e.g., PostgreSQL, Supabase, Redis]
- **AI/ML:** [e.g., LangChain, LangGraph, OpenAI API]
- **DevOps:** [e.g., Docker, GitHub Actions, Terraform]

### Development Philosophy
[2-4 bullet points. How you like to work. These inform how the pair-program
skill interacts with you.]
- [e.g., "AI generates code, humans own it. I maintain code ownership and
  architectural understanding."]
- [e.g., "Avoid over-engineering. Research decisions carefully, then build
  with minimal dependencies."]
- [e.g., "Review before shipping. Fresh sessions to review AI-touched code."]

### Currently Learning
[Topics you're actively studying. pair-program gives the deepest explanations
and most thorough understanding checks for these.]
- **[Topic]**: [what specifically] (status: [not-started / in-progress])
- **[Topic]**: [what specifically] (status: [not-started / in-progress])

### Deepening
[Topics you're familiar with but want production-level depth. pair-program gives
moderate explanations.]
- **[Topic]**: [what specifically] (status: [familiar / practicing])

### Strong Skills
[Topics where you're confident. pair-program gives light-touch explanations
unless something unusual comes up.]
- [Topic]
- [Topic]
```

### Examples

In the README, these examples should use collapsible `<details>` sections so they don't overwhelm the page. Collapsed by default, expandable on click.

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

Notice the difference: the junior's "Currently Learning" section is full of things the senior has in "Strong Skills." That's the whole point. `pair-program` would give the junior deep, foundational explanations for React hooks and SQL joins. The same skill would breeze past those topics for the senior and focus understanding checks on LangChain and RAG instead. Same tool, calibrated to the developer.

### How each skill uses the Developer Profile

| Skill | What it reads | How it uses it |
|---|---|---|
| `pair-program` | About Me, skill tiers, philosophy | Calibrates explanation depth to experience level and per sub-step topic. A junior gets "here's what this pattern is and why it matters." A senior gets "here's why I'd pick this pattern over the alternative." Topics in "Currently Learning" get deep explanations and harder understanding checks regardless of experience level. "Strong Skills" get quick overviews. Respects development philosophy, but project-level philosophy (in ARCHITECTURE.md → Project Conventions) takes precedence over the global Developer Profile when both exist. |
| `create-prd` | About Me only | Calibrates depth of questions and discussion to experience level. Does **not** use tech stack or learning goals to influence tool/language recommendations. Tech stack decisions are based on project needs, not developer familiarity. |
| `create-architecture` | About Me only | Calibrates discussion depth to experience level. For design mode, recommends architecture based on project requirements, not developer's existing stack. For reverse-engineer mode, the Developer Profile isn't used (the codebase is the source of truth). |
| `create-issues` | Not used | Issues are for workflow organization. No learning tier labels. `pair-program` handles learning-aware guidance during implementation. |
| `create-roadmap` | Skill tiers (lightly) | May order steps so that "Currently Learning" topics come after foundational setup, giving the developer context before hitting unfamiliar territory. |
| `update-docs`, `create-adr` | Not used | These skills don't need personalization. |

---

## Installation & Distribution

Tandem is published as a public npm package (free) under the `@tandemdev` scope. The GitHub repo is named `tandem`; the npm package is `@tandemdev/cli`. The branding is just "Tandem" everywhere that matters (README, docs, conversation). The npm scope is just plumbing.

**npm org:** Create a free `tandemdev` organization on npmjs.com.
**GitHub repo:** `github.com/[yourusername]/tandem`
**npm package:** `@tandemdev/cli`

### Install command

```bash
npx @tandemdev/cli init
```

This copies command files to `.claude/commands/` and templates to `.tandem/templates/`. That's it. No global installs, no dependencies, no build step.

### What the installer does

1. Copies all command files (`.md`) to `.claude/commands/` so Claude Code can find them as slash commands (`/create-manifest`, `/pair-program`, `/create-prd`, etc.).
2. Creates `.tandem/templates/` with the manifest template, issue template, and developer profile template.
3. Does NOT create `tandem.json`. The manifest is created by `/create-manifest` or by the first creation skill that needs it (e.g., `/create-prd`).
4. Does NOT modify `~/.claude/CLAUDE.md`. The developer profile is optional and the developer adds it themselves using the template as a reference.

### Installed structure (in the developer's project)

```
project-root/
  .claude/
    commands/
      create-manifest.md       (invoked with /create-manifest)
      pair-program.md          (invoked with /pair-program)
      create-prd.md            (invoked with /create-prd)
      create-architecture.md   (invoked with /create-architecture)
      create-roadmap.md        (invoked with /create-roadmap)
      create-issues.md         (invoked with /create-issues)
      create-adr.md            (invoked with /create-adr)
      update-docs.md           (invoked with /update-docs)
  .tandem/
    templates/
      tandem.json             (manifest template, copied to project root when needed)
      github-issue.md          (issue template, customizable)
      developer-profile.md     (CLAUDE.md Developer Profile template, for reference)
  tandem.json                 (created by /create-manifest or first creation skill)
```

### Repo structure (what lives on GitHub / npm)

```
tandem/
  README.md
  LICENSE                        (MIT)
  package.json                   (npm package: @tandemdev/cli)
  bin/
    tandem.js                   (CLI entry point: handles `npx @tandemdev/cli init`)
  commands/
    create-manifest.md
    pair-program.md
    create-prd.md
    create-architecture.md
    create-roadmap.md
    create-issues.md
    create-adr.md
    update-docs.md
  templates/
    tandem.json
    github-issue.md
    developer-profile.md
  docs/
    workflows.md                 (detailed workflow documentation)
    customization.md             (how to adapt skills to your workflow)
```

### How the CLI works

The `bin/tandem.js` script is minimal. It:
1. Checks that `.claude/` exists (or creates it with `commands/` subdirectory).
2. Copies `commands/*.md` to `.claude/commands/`.
3. Creates `.tandem/templates/` and copies templates into it.
4. Prints a summary of what was installed and a quick-start guide.

This is a small Node.js script (probably <100 lines). No framework, no dependencies beyond Node's built-in `fs` and `path`. The hard part is the skill files, not the installer.

### Updating

```bash
npx @tandemdev/cli init
```

Same command. The installer overwrites command files with the latest versions. Templates in `.tandem/templates/` are also updated. The developer's `tandem.json` and `dev-docs/` are never touched.

---

## Build Order

1. **`pair-program`** - Battle-tested core. Generalize the existing skill as a `.claude/commands/` markdown file.
2. **`create-manifest`** - The entry point for brownfield projects. Build alongside pair-program since pair-program suggests creating one when `tandem.json` doesn't exist.
3. **`create-prd`** - Feeds into everything else for greenfield. Should auto-create `tandem.json` if it doesn't exist and register its output.
4. **`create-architecture`** - Now useful for all project types. Reverse-engineer mode makes it immediately valuable for brownfield/bluefield (the "help me understand this codebase" use case).
5. **`create-roadmap`** - Depends on PRD, feeds into pair-program.
6. **`create-adr`** - Simple, standalone, useful immediately.
7. **`update-docs`** - Ties everything together.
8. **`create-issues`** - Optional, build last.
9. **Installer (`bin/tandem.js`)** - The CLI script, `package.json` (scoped as `@tandemdev/cli`), npm org creation, and npm publish. Build this once you have at least `pair-program`, `create-manifest`, and `create-prd` working so you can test the full install flow.
10. **README** - Installation instructions, quick start, collapsible workflow examples, developer profile examples, pitch.

---

## Resolved Decisions

All open decisions have been resolved. Kept here for reference.

### General
- [x] **Name:** Tandem. "Working in tandem" = two entities moving together at the same pace. Covers the whole workflow (plan, design, build, document), not just pair programming. More distinctive and memorable than Pairkit. Sounds like a methodology, not a derivative of Speckit.
- [x] **License:** MIT. Standard for developer tools, maximizes adoption.
- [x] **Junior developer profile example:** Yes. Both examples use collapsible `<details>` sections in the README.
- [x] **README demo workflow:** Yes, with collapsible sections. Quick Start (greenfield, always visible), brownfield and bluefield in collapsible sections.
- [x] **README pitch framing:** Lead with the problem. Three beats: AI makes you fast but you lose understanding, specs don't fix this, Tandem is pair programming that teaches. Val will adjust voice/tone before publishing.

---

## Changelog

| Date | Change |
|---|---|
| 2026-03-18 | Initial plan created from discussion between Val and Claude |
| 2026-03-18 | Added Developer Profile template based on Val's CLAUDE.md structure |
| 2026-03-18 | Established core philosophy: ownership + speed, not ownership or speed. Made all skills experience-agnostic (junior through staff). Removed assessment-specific and experience-specific language throughout. |
| 2026-03-18 | Expanded `create-architecture` to work for all project types. Added three modes: design (greenfield), reverse-engineer (brownfield), migration plan (bluefield). Reverse-engineer mode maps existing codebases for developers inheriting unfamiliar projects. Bumped up in build order. |
| 2026-03-18 | Resolved pair-program open questions. Understanding checks skippable via conversational cue (README tip). Tests offered when framework detected. Multi-file sub-steps handled naturally. Opened discussion on project conventions doc (Speckit constitution equivalent). |
| 2026-03-18 | Resolved conventions discussion: lives as optional section in ARCHITECTURE.md, not a separate file. Added Project Conventions section to architecture doc template with subsections for testing, code style, error handling, commits/PRs, and AI rules. Updated pair-program to reference conventions on every sub-step. |
| 2026-03-18 | Resolved create-prd open questions. Tech stack neutrality: skills never recommend tools based on developer's existing stack or learning goals. PRD Learning Goals section is optional (personal/portfolio projects only). Template is flexible, not fixed. Added plan mode recommendation for create-prd and create-architecture. Updated Developer Profile usage table. |
| 2026-03-18 | Resolved all create-architecture open questions. Mermaid system diagram in System Overview, Mermaid ERD in Data Model (full schema). Adaptive scan depth for reverse-engineer mode (scales with project size). "Unanswered Questions" section: minimal, only in reverse-engineer/migration modes, temporary. Codebase Map and Entry Points sections now part of the base template but deferred for greenfield (added later via update-docs once code exists). Updated update-docs to support architecture enrichment use case. |
| 2026-03-18 | Resolved create-roadmap open questions. No time estimates (keep minimal). Architecture references optional. Added user stories to roadmap step template where applicable. |
| 2026-03-18 | Resolved all create-issues open questions. Dropped learning tier labels and learning goal tags from issues (pair-program handles learning now). Issues link back to roadmap steps. pair-program pulls GitHub issue context via `gh` CLI with graceful degradation. Added issue template to repo. Updated pair-program to close issues on completion and flag roadmap/issue discrepancies. Cleaned up stale open questions in pair-program spec. |
| 2026-03-18 | Resolved all update-docs open questions. Version header approach: two-line header at top of each doc (last updated + last change), overwritten not appended. Domain-based authority for conflicts: PRD owns what/why, architecture owns how, roadmap owns order, ADRs own decision rationale. Conflicts are always flagged and confirmed with developer. All doc-generating skills should include the version header at creation time. |
| 2026-03-18 | Development philosophy now lives in two places with project-level precedence. Global default in Developer Profile (~/.claude/CLAUDE.md), project-specific override in ARCHITECTURE.md Project Conventions. Added Development Philosophy subsection to conventions template. Updated pair-program context loading to explain precedence chain. |
| 2026-03-18 | Cleaned up Open Decisions section. Removed all resolved decisions (kept in each skill's own "Resolved questions" section). Only unresolved General questions remain. |
| 2026-03-18 | Named the project **Tandem**. "Working in tandem" captures the full workflow, not just pair programming. Updated title, repo structure, and resolved the naming question. |
| 2026-03-18 | MIT license. Added junior developer profile example. Both examples use collapsible `<details>` sections. Resolved junior example and license questions. |
| 2026-03-18 | All open decisions resolved. README uses collapsible workflows (greenfield visible, brown/bluefield collapsed). Pitch leads with the problem. Renamed Open Decisions section to Resolved Decisions. **Plan is complete.** |
| 2026-03-23 | Added `tandem.json` project manifest. Universal table of contents for all project docs (greenfield and brownfield). Replaces hardcoded `dev-docs/` scanning with manifest-driven discovery. Skills find docs by tags (`prd`, `architecture`, `roadmap`, `adr`). `pair-program` loads only task-relevant docs using scope/purpose/tags matching for token efficiency. Creation skills auto-register new docs. `update-docs` reads files as-is and preserves existing structure (creation skills are opinionated, update skills are respectful). Removed `paths` section after determining `docs` array handles all use cases. Updated all skill specs to use manifest. Added manifest template to repo structure. |
| 2026-03-30 | Updated `update-docs` purpose in skills table: "Update all relevant documents when a decision changes." Added `config` section to `tandem.json` manifest with `understandingChecks` toggle (default: `true`). Developers can turn understanding checks on/off project-wide via the manifest instead of telling the agent repeatedly. Zero additional token cost since `pair-program` already reads the manifest. Updated pair-program step 5 and resolved questions to reference config. |
| 2026-03-31 | Two-way linking between roadmap and GitHub issues. `create-issues` now updates each roadmap step with a link to its issue (e.g., "GitHub Issue: #12") after creating issues. `update-docs` detects when a modified roadmap step has a linked issue and offers to update the issue via `gh issue edit`. Updated roadmap template, create-issues workflow, and update-docs design notes. |
| 2026-03-31 | Corrected file structure for Claude Code compatibility. Skills are now `.claude/commands/*.md` files (invoked as `/pair-program`, `/create-prd`, etc.), not standalone SKILL.md directories. Templates live in `.tandem/templates/`. Added npm/npx installation approach: `npx @tandemdev/cli init` copies commands and templates into the project. Repo includes `bin/tandem.js` CLI entry point and `package.json` for npm publishing (free, public). Updated build order to include installer and README. |
| 2026-04-01 | Renamed project from Pairkit to **Tandem**. Updated all references (52 instances), manifest filename (`tandem.json`), templates directory (`.tandem/`), CLI (`npx @tandemdev/cli init`), and resolved decision rationale. |
| 2026-04-01 | Added `create-manifest` skill. Two modes: scan (brownfield, scans repo for docs and builds manifest with developer review) and initialize (greenfield, creates minimal manifest). Suite is now 7 skills + 1 optional. Updated workflows (brownfield starts with create-manifest), skill numbering, installed/repo structure, build order (#2 after pair-program), manifest section, and pair-program context loading (now suggests `/create-manifest` instead of scanning itself). |
| 2026-04-01 | Added "For the Implementer" section at top of plan for Claude Code handoff. Includes: use Context7 MCP for Claude Code docs, build order reference, what the plan covers vs. doesn't cover, command file format (plain markdown, no frontmatter), key conventions. Ready for implementation. |
| 2026-04-01 | npm package scoped as `@tandemdev/cli`. GitHub repo = `tandem`, npm package = `@tandemdev/cli`. Install command: `npx @tandemdev/cli init`. Requires creating a free `tandemdev` npm org. Updated all install references, repo structure, and build order. |