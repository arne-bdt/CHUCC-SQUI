# Task 83: Comprehensive Project Review with Specialized Agents

**Status:** PENDING
**Priority:** MEDIUM
**Estimated Effort:** 4-8 hours (execution in fresh context window)
**Dependencies:** None (can run independently)
**Agent Required:** ALL agents (component-dev, testing, ui-ux, datagrid, sparql-protocol, docs)

## Overview

Conduct a systematic, comprehensive review of the entire SQUI codebase using all specialized agents to identify quality improvements, consistency issues, technical debt, and enhancement opportunities.

**Execution Strategy:**
- **MUST run in a fresh context window** (start new conversation)
- **Systematic review** using each specialized agent sequentially
- **Document all findings** in structured format
- **Generate improvement backlog** for future sprints

**Purpose:**
- Quality assurance for pre-1.0 release
- Identify hidden issues before they become problems
- Ensure consistency across all components
- Create roadmap for remaining improvements

## Why Fresh Context Window?

**Benefits:**
1. **Full token budget** for deep analysis (not limited by conversation history)
2. **Comprehensive file reading** without token constraints
3. **Detailed agent outputs** without truncation
4. **Systematic execution** of all agent reviews
5. **Complete findings documentation** in single session

**Approach:**
- Create new conversation with Claude Code
- Load this task specification
- Execute all agent reviews sequentially
- Compile comprehensive findings report
- Update task backlog with actionable items

## Review Scope

### 1. Component Development Review (component-dev agent)

**Focus Areas:**
- Svelte 5 patterns compliance (runes usage, no legacy patterns)
- Component structure and organization
- Props and event handling patterns
- Store integration and reactivity
- Code duplication and reuse opportunities
- TypeScript type safety and strictness

**Components to Review:**
- `src/lib/components/Editor/` (SPARQL editor)
- `src/lib/components/Endpoint/` (endpoint selection and dashboard)
- `src/lib/components/Results/` (result visualization)
- `src/lib/components/Tabs/` (multi-query tabs)
- `src/lib/components/Toolbar/` (action buttons)
- `src/lib/components/Capabilities/` (endpoint capabilities)
- `src/lib/components/Functions/` (extension functions)

**Expected Output:**
- Component quality score (1-5 stars) for each directory
- List of inconsistencies or anti-patterns
- Refactoring opportunities
- Recommended improvements

### 2. Testing Review (testing agent)

**Focus Areas:**
- Test coverage analysis (unit, integration, E2E)
- Test quality and maintainability
- Missing test scenarios
- Flaky tests or brittle selectors
- Test organization and structure
- Mock/stub usage patterns

**Test Files to Review:**
- `tests/unit/**/*.test.ts` (unit tests)
- `tests/integration/**/*.test.ts` (integration tests)
- `tests/e2e/**/*.spec.ts` (E2E tests)
- `src/lib/components/**/*.stories.ts` (Storybook stories)

**Expected Output:**
- Overall test coverage metrics
- Coverage gaps by component/feature
- Test quality score (1-5 stars)
- Recommended additional test scenarios
- Test maintenance issues

### 3. UI/UX Review (ui-ux agent)

**Focus Areas:**
- Carbon Design System compliance
- Accessibility (WCAG 2.1 AA)
- Responsive design patterns
- Spacing and typography consistency
- Color and theming usage
- ARIA attributes and semantic HTML
- Keyboard navigation support
- Screen reader compatibility

**UI Components to Review:**
- All Svelte components in `src/lib/components/`
- CSS files in `src/lib/styles/`
- Storybook stories for visual verification

**Expected Output:**
- UI/UX quality score (1-5 stars) per component
- Accessibility violations (automated + manual)
- Design system compliance issues
- Recommended improvements

### 4. DataGrid Review (datagrid agent)

**Focus Areas:**
- SVAR DataGrid implementation and configuration
- Performance optimization (virtual scrolling, large datasets)
- Column management and customization
- Row selection and interaction patterns
- Integration with results store
- Error handling and edge cases

**Files to Review:**
- `src/lib/components/Results/DataTable.svelte`
- `src/lib/components/Results/DataTable.stories.ts`
- `tests/integration/DataTable.test.ts`
- `tests/e2e/data-table.storybook.spec.ts`

**Expected Output:**
- DataGrid implementation quality score (1-5 stars)
- Performance optimization opportunities
- Configuration improvements
- Edge case handling gaps

### 5. SPARQL Protocol Review (sparql-protocol agent)

**Focus Areas:**
- SPARQL 1.2 Protocol compliance
- Content negotiation (Accept headers)
- Request/response handling
- Error handling and recovery
- Result format parsing (JSON, XML, CSV, TSV, Turtle, etc.)
- Query validation and sanitization
- Endpoint compatibility

**Files to Review:**
- `src/lib/services/sparqlService.ts`
- `src/lib/services/serviceDescriptionService.ts`
- `src/lib/parsers/` (result format parsers)
- `tests/unit/sparqlService.test.ts`

**Expected Output:**
- Protocol compliance score (1-5 stars)
- Specification adherence gaps
- Error handling improvements
- Parser robustness issues

### 6. Documentation Review (docs agent)

**Focus Areas:**
- README completeness and accuracy
- Code comments and JSDoc
- Architecture documentation
- API documentation
- Usage examples
- Contributing guidelines
- Changelog maintenance

**Files to Review:**
- `README.md`
- `CHANGELOG.md`
- `.claude/CLAUDE.md`
- `docs/**/*.md`
- `.tasks/README.md`
- JSDoc comments in source files

**Expected Output:**
- Documentation quality score (1-5 stars)
- Missing or outdated documentation
- Recommended additions
- Consistency issues

## Execution Plan

### Phase 1: Agent Reviews (6-8 hours)

Execute each agent review sequentially in a fresh context window:

```bash
# Start new Claude Code conversation
# Load this task file: .tasks/83-comprehensive-project-review.md

# 1. Component Development Review (1-1.5 hours)
Task({
  subagent_type: "general-purpose",
  description: "Review component development",
  prompt: "You are the component-dev agent. Review all Svelte components in src/lib/components/ for Svelte 5 compliance, consistency, and quality. Provide detailed findings with code examples and scores."
});

# 2. Testing Review (1.5-2 hours)
Task({
  subagent_type: "general-purpose",
  description: "Review test coverage",
  prompt: "You are the testing agent. Analyze test coverage across unit, integration, and E2E tests. Identify gaps, quality issues, and improvement opportunities. Provide specific recommendations."
});

# 3. UI/UX Review (1-1.5 hours)
Task({
  subagent_type: "general-purpose",
  description: "Review accessibility and UX",
  prompt: "You are the ui-ux agent. Review all UI components for Carbon Design System compliance, WCAG 2.1 AA accessibility, and UX best practices. Document violations and recommendations."
});

# 4. DataGrid Review (0.5-1 hour)
Task({
  subagent_type: "general-purpose",
  description: "Review DataGrid implementation",
  prompt: "You are the datagrid agent. Review DataTable component implementation for performance, configuration, and best practices. Provide optimization recommendations."
});

# 5. SPARQL Protocol Review (1-1.5 hours)
Task({
  subagent_type: "general-purpose",
  description: "Review SPARQL protocol compliance",
  prompt: "You are the sparql-protocol agent. Review SPARQL service implementation for protocol compliance, error handling, and parser robustness. Identify specification gaps."
});

# 6. Documentation Review (0.5-1 hour)
Task({
  subagent_type: "general-purpose",
  description: "Review documentation completeness",
  prompt: "You are the docs agent. Review all project documentation for completeness, accuracy, and consistency. Recommend improvements and additions."
});
```

### Phase 2: Findings Compilation (1-2 hours)

Compile all agent findings into a structured report:

```markdown
# SQUI Comprehensive Review Report

**Date:** [Review Date]
**Context:** Pre-1.0 Release Quality Assurance

## Executive Summary
- Overall Quality Score: [X.X/5.0]
- Critical Issues: [count]
- High Priority: [count]
- Medium Priority: [count]
- Low Priority: [count]

## Agent Review Scores
- Component Development: [X.X/5.0]
- Testing Coverage: [X.X/5.0]
- UI/UX Quality: [X.X/5.0]
- DataGrid Implementation: [X.X/5.0]
- SPARQL Protocol: [X.X/5.0]
- Documentation: [X.X/5.0]

## Detailed Findings

### Component Development
[component-dev agent findings]

### Testing Coverage
[testing agent findings]

### UI/UX Quality
[ui-ux agent findings]

### DataGrid Implementation
[datagrid agent findings]

### SPARQL Protocol Compliance
[sparql-protocol agent findings]

### Documentation Completeness
[docs agent findings]

## Improvement Backlog

### Critical (Fix Before 1.0)
1. [Issue 1]
2. [Issue 2]

### High Priority (Target for 1.1)
1. [Issue 1]
2. [Issue 2]

### Medium Priority (Future Enhancement)
1. [Issue 1]
2. [Issue 2]

### Low Priority (Nice to Have)
1. [Issue 1]
2. [Issue 2]

## Recommendations

### Immediate Actions (This Sprint)
- [Action 1]
- [Action 2]

### Short-Term (Next Sprint)
- [Action 1]
- [Action 2]

### Long-Term (Roadmap)
- [Action 1]
- [Action 2]
```

### Phase 3: Task Creation (30-60 minutes)

Create task files for high-priority findings:

```bash
# Example: If component-dev agent finds TypeScript strictness issues
.tasks/84-improve-typescript-strictness.md

# Example: If testing agent finds E2E coverage gaps
.tasks/85-complete-e2e-coverage.md

# Example: If ui-ux agent finds accessibility violations
.tasks/86-fix-accessibility-violations.md

# etc.
```

## Deliverables

### 1. Comprehensive Review Report
**File:** `docs/reviews/2025-comprehensive-review.md`

**Contents:**
- Executive summary with overall quality score
- Detailed findings from each agent
- Prioritized improvement backlog
- Specific recommendations with code examples

### 2. Updated Task Backlog
**Files:** `.tasks/84-*.md`, `.tasks/85-*.md`, etc.

**Contents:**
- Task specifications for high-priority findings
- Clear acceptance criteria
- Estimated effort and dependencies
- Implementation guidance

### 3. Updated Project Documentation
**Files:** `README.md`, `.tasks/README.md`, `CHANGELOG.md`

**Contents:**
- Updated status section with new tasks
- Documented known issues
- Roadmap updates based on findings

## Success Criteria

- ✅ All 6 agent reviews completed successfully
- ✅ Comprehensive findings report generated
- ✅ All findings categorized by priority (Critical/High/Medium/Low)
- ✅ Task files created for high-priority issues
- ✅ Overall quality score calculated
- ✅ Improvement roadmap documented
- ✅ Project documentation updated

## Execution Checklist

### Pre-Review
- [ ] Start fresh Claude Code conversation
- [ ] Verify all files accessible
- [ ] Prepare template for findings compilation

### During Review
- [ ] Execute component-dev agent review
- [ ] Execute testing agent review
- [ ] Execute ui-ux agent review
- [ ] Execute datagrid agent review
- [ ] Execute sparql-protocol agent review
- [ ] Execute docs agent review
- [ ] Document all findings with examples

### Post-Review
- [ ] Compile comprehensive findings report
- [ ] Calculate overall quality scores
- [ ] Prioritize all findings
- [ ] Create task files for high-priority items
- [ ] Update project documentation
- [ ] Commit all review artifacts

## Notes

**Timing:**
- Best executed after Tasks 81-82 completion
- Ideal before 1.0 release preparation
- Requires dedicated 4-8 hour session

**Context Management:**
- MUST use fresh conversation (critical for comprehensive analysis)
- Save findings incrementally (avoid losing work)
- Use structured prompts for consistent agent responses

**Follow-up:**
- Review findings with team/stakeholders
- Prioritize tasks based on release schedule
- Schedule implementation sprints for high-priority items
- Re-run review after major milestones

## References

- [CLAUDE.md - Specialized Agents](.claude/CLAUDE.md#specialized-agents---use-for-complex-tasks)
- [Task Template](.tasks/00-GETTING-STARTED.md)
- [Carbon Design Guidelines](https://carbondesignsystem.com/)
- [WCAG 2.1 AA Standards](https://www.w3.org/WAI/WCAG21/quickref/)
- [SPARQL 1.2 Protocol](https://www.w3.org/TR/sparql12-protocol/)
