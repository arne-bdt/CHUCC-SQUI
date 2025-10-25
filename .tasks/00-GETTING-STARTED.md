# Getting Started with SQUI Implementation

## Overview

This task breakdown implements the **SPARQL Query UI Web Component** specification located at:
`docs/SPARQL Query UI Web Component Specification.pdf`

The implementation consists of **50 incremental tasks** organized into **12 phases**.

## What Has Been Created

### Task Documentation Structure

```
tasks/
├── 00-GETTING-STARTED.md          ← You are here
├── README.md                       ← Task organization overview
├── task-index.md                   ← Quick reference table with dependencies
├── MASTER-TASKS.md                 ← Concise descriptions of all 50 tasks
├── IMPLEMENTATION-GUIDE.md         ← Detailed guide for AI agents
├── 01-carbon-integration.md        ← Detailed task specs (Foundation)
├── 02-basic-layout.md
├── 03-configuration-types.md
├── 04-state-management.md
├── 05-localization-setup.md
├── 06-codemirror-integration.md    ← Detailed task specs (Editor)
├── 07-keyword-autocompletion.md
├── 08-prefix-service.md
├── 09-prefix-autocompletion.md
└── 16-sparql-protocol.md           ← Critical implementation task
```

## For Human Developers

### Quick Start

1. **Read the specification**: `docs/SPARQL Query UI Web Component Specification.pdf`
2. **Review task index**: `tasks/task-index.md` for dependency graph
3. **Check MASTER-TASKS.md**: Get overview of all 50 tasks
4. **Start with Task 01**: Follow detailed task files sequentially

### Minimum Viable Product (MVP) Path

To get a working prototype quickly, execute these tasks in order:

1. **Task 01-04**: Foundation (state management, types, stores)
2. **Task 06**: CodeMirror editor integration
3. **Task 08**: Prefix management
4. **Task 11**: Query execution button
5. **Task 13, 16**: Endpoint and SPARQL protocol
6. **Task 19-21**: Basic results display
7. **Task 35**: Raw view

**Estimated effort for MVP**: 3-4 weeks for one developer

### Full Implementation Path

Execute all tasks 01-50 sequentially (respecting dependencies):

**Estimated effort**: 12-18 weeks for one developer, 6-9 weeks for two

## For AI Agents

### Instructions

When asked to "implement tasks for SQUI":

1. **Start with**: `tasks/IMPLEMENTATION-GUIDE.md`
2. **Check dependencies**: Use `tasks/task-index.md`
3. **Read detailed tasks**: Start with `01-carbon-integration.md`
4. **Follow the pattern**: Each task has:
   - Clear objective
   - Requirements from specification
   - Step-by-step implementation
   - Acceptance criteria
   - Testing requirements
   - Commit message template

### Execution Standards

Every task must:
- ✅ Pass all tests (`npm test`)
- ✅ Build successfully (`npm run build`)
- ✅ Follow TypeScript/ESLint rules
- ✅ Include proper tests (>80% coverage target)
- ✅ Use Svelte 5 runes (not legacy patterns)
- ✅ Use Carbon components consistently
- ✅ Meet accessibility standards
- ✅ Work in all 4 Carbon themes

### Commit After Each Task

After completing each task:

```bash
git add .
git commit -m "feat(task-XX): [task title]

[implementation summary]

Task: #XX"
git push
```

## Project Context

### Technology Stack

- **Framework**: Svelte 5 (v5.41.x+)
- **Design System**: IBM Carbon Design System
- **Data Grid**: SVAR Svelte DataGrid v2 (`wx-svelte-grid`)
- **Code Editor**: CodeMirror 6
- **Build Tool**: Vite
- **Testing**: Vitest (unit), Playwright (E2E)
- **Language**: TypeScript

### Key Features to Implement

1. **SPARQL Editor** with syntax highlighting and autocompletion
2. **Endpoint Management** with validation and catalogue
3. **Query Execution** following SPARQL 1.2 Protocol
4. **Tabular Results** with virtual scrolling and rich interactions
5. **Raw Response View** with multiple format support
6. **Downloads** in various formats
7. **Multiple Query Tabs** with persistence
8. **Accessibility** (WCAG AA compliance)
9. **Theming** (4 Carbon themes)
10. **NPM Package** and standalone deployment

## Task Phases

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1. Foundation | 01-05 | Carbon, layout, types, stores, i18n |
| 2. SPARQL Editor | 06-12 | CodeMirror, autocompletion, prefixes |
| 3. Endpoint Management | 13-15 | Input, validation, catalogue |
| 4. SPARQL Protocol | 16-18 | Query execution, headers, errors |
| 5. Basic Results | 19-24 | Parsing, table view, IRI display |
| 6. Advanced Table | 25-31 | Sorting, filtering, resizing, columns |
| 7. Large Results | 32-34 | Virtual scrolling, chunking, limits |
| 8. Raw & Downloads | 35-38 | Raw view, format switching, downloads |
| 9. Multiple Tabs | 39-41 | Tab management, state, persistence |
| 10. Accessibility & Polish | 42-44 | WCAG, keyboard nav, themes |
| 11. Testing | 45-47 | Unit, integration, E2E tests |
| 12. Packaging | 48-50 | NPM package, standalone, optimization |

## Estimates

- **Per Task**: 2-5 hours average
- **Phase 1**: 1-2 weeks
- **Phases 2-5**: 4-6 weeks
- **Phases 6-9**: 3-4 weeks
- **Phases 10-12**: 2-3 weeks

**Total**: 120-160 developer hours

## Success Criteria

The implementation is complete when:

- [ ] All 50 tasks are marked as DONE
- [ ] All tests pass (`npm test` shows 100% pass rate)
- [ ] Test coverage >80% for services and utilities
- [ ] Build succeeds (`npm run build`)
- [ ] Component works as NPM package
- [ ] Standalone demo deployed
- [ ] Documentation complete
- [ ] All 4 Carbon themes work correctly
- [ ] WCAG AA accessibility standards met
- [ ] Works in Chrome, Firefox, Safari, Edge (latest)

## Next Steps

1. **For first-time setup**:
   ```bash
   cd /c/rd/CHUCC-SQUI
   npm install
   npm run dev
   ```

2. **Start implementation**:
   - Open `tasks/01-carbon-integration.md`
   - Follow the implementation steps
   - Write tests
   - Commit with provided message template
   - Move to task 02

3. **Track progress**:
   - Update task file status from TODO to IN_PROGRESS to DONE
   - Check off acceptance criteria
   - Update phase checklist in IMPLEMENTATION-GUIDE.md

## Questions?

- **Specification unclear?** → Check `docs/SPARQL Query UI Web Component Specification.pdf`
- **Task dependencies?** → See `tasks/task-index.md`
- **Implementation patterns?** → See `tasks/IMPLEMENTATION-GUIDE.md`
- **Testing strategy?** → Each task file has Testing section
- **Svelte 5 questions?** → https://svelte.dev/
- **Carbon questions?** → https://carbondesignsystem.com/

---

**Ready to start? Open** `tasks/01-carbon-integration.md` **and begin!**
