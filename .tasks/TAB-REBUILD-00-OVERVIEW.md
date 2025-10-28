# Tab System Rebuild - Incremental Approach

## Problem Statement

The current tab switching implementation has a critical bug: when switching between tabs, the editor content does not update correctly. Despite extensive debugging (see `TAB-SWITCHING-DEBUG-SUMMARY.md`), the issue persists due to complex reactivity interactions between:

- Carbon Tabs component
- CodeMirror editor's updateListener
- Svelte 5 stores and subscriptions
- Multiple layers of state synchronization

## Strategy: Incremental Rebuild with TDD

Instead of debugging the existing complex implementation, we will:

1. **Build a new component from scratch** (`SparqlQueryUIV2.svelte`)
2. **Add features incrementally** - One layer at a time
3. **Write comprehensive tests at each step** - Before moving to the next layer
4. **Isolate the exact point where reactivity breaks** - Or end up with a working replacement

## Success Criteria

- ✅ All tests pass at each incremental step
- ✅ Identify exactly which layer introduces the tab switching bug
- ✅ Either: Fix the specific layer where it breaks
- ✅ Or: Complete a working replacement component

## Task Breakdown

### Phase 1: Foundation
- **Task 1**: Minimal Tabs Component (tabs + basic state only)
- **Task 2**: Add Toolbar Integration

### Phase 2: Critical Layer (Where Bug Likely Exists)
- **Task 3**: Add CodeMirror Editor with Tab Switching
- **Task 4**: Verify Editor Content Switches Correctly

### Phase 3: Complete Feature Set
- **Task 5**: Add Results Table Integration
- **Task 6**: Add All Advanced Features (share, save, history, etc.)

### Phase 4: Integration
- **Task 7**: Performance Testing with Large Datasets
- **Task 8**: Replace Old Component and Migrate Stories

## Expected Outcome

One of two outcomes:

1. **Bug Isolated**: We discover exactly which layer (Task 3 or 4) introduces the tab switching bug, fix it there, and backport the fix to the main component
2. **Working Replacement**: The new component works perfectly, we replace the old one

## Files Created

- `.tasks/TAB-REBUILD-00-OVERVIEW.md` (this file)
- `.tasks/TAB-REBUILD-01-MINIMAL-TABS.md`
- `.tasks/TAB-REBUILD-02-ADD-TOOLBAR.md`
- `.tasks/TAB-REBUILD-03-ADD-EDITOR.md`
- `.tasks/TAB-REBUILD-04-ADD-RESULTS.md`
- `.tasks/TAB-REBUILD-05-INTEGRATION.md`

## References

- Original tasks: `.tasks/39-multi-tab-support.md`, `.tasks/40-tab-state-management.md`, `.tasks/41-tab-ui-components.md`
- Debug history: `TAB-SWITCHING-DEBUG-SUMMARY.md`
- Current implementation: `src/SparqlQueryUI.svelte`, `src/lib/components/Tabs/QueryTabs.svelte`
