# Engineering Contracts

These contracts define the non-negotiable standards for frontend development in this project. They apply to all contributors — human and AI.

Each contract governs a distinct phase of the build lifecycle:

| Contract | Phase | When to use |
|---|---|---|
| [01.planning.contract.md](01.planning.contract.md) | Pre-development | Before writing any code |
| [02.development.contract.md](02.development.contract.md) | Active development | While writing code |
| [03.refinement.contract.md](03.refinement.contract.md) | Post-development | Before marking a task done or opening a PR |

## How to use these contracts

1. When starting a new feature or task, open `01.planning.contract.md` and work through every section. Do not start coding until the planning checklist is complete.
2. Keep `02.development.contract.md` open as a reference standard while implementing. Any deviation from its rules is a defect, not a style choice.
3. After implementation, run the full audit in `03.refinement.contract.md` before committing or opening a PR.

## Architecture references

These contracts operate alongside the project's architecture documents:

- [AGENTS.md](../AGENTS.md) — authoritative frontend architecture rules
- [APP_SCOPED_SESSIONS.md](../APP_SCOPED_SESSIONS.md) — session isolation rules per app
- `CLAUDE.md` (repo root) — engineering standards contract for Claude Code sessions
