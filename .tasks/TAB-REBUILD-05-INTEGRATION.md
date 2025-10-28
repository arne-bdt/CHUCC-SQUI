# Task: TAB-REBUILD-05 - Final Integration & Replacement

## Objective

Complete the rebuilt tab component with all features (real SPARQL execution, endpoint selection, history, etc.) and replace the broken `SparqlQueryUI.svelte` component.

## Prerequisite

✅ **TAB-REBUILD-04** complete with all tests passing
✅ **Root cause fix documented** and proven to work

## Acceptance Criteria

- ✅ Real SPARQL queries execute against endpoints
- ✅ All toolbar features work (format selector, share, save, history)
- ✅ Endpoint selection per tab
- ✅ Results can be downloaded in multiple formats
- ✅ localStorage persistence works
- ✅ All existing Storybook stories migrated
- ✅ **ALL 687+ TESTS PASS** (including new ones)
- ✅ Build succeeds with zero errors/warnings
- ✅ E2E tests confirm tab switching works in production build

## Implementation Steps

### Step 1: Wire Up Real SPARQL Execution

Replace mock execution with real `sparqlService`:

```typescript
import { sparqlService } from '$lib/services/sparqlService';

async function executeQuery(tabId: string) {
  const tabData = tabDataMap.get(tabId);
  if (!tabData) return;

  tabData.isExecuting = true;
  tabDataMap = new Map(tabDataMap);

  try {
    const results = await sparqlService.executeQuery(
      tabData.editorText,
      tabData.endpoint || defaultEndpoint
    );

    tabData.results = results;
    tabData.error = null;
  } catch (error) {
    tabData.error = error instanceof Error ? error.message : 'Unknown error';
    tabData.results = null;
  } finally {
    tabData.isExecuting = false;
    tabDataMap = new Map(tabDataMap);
  }
}
```

### Step 2: Add All Toolbar Features

Integrate existing toolbar components:

```svelte
<script lang="ts">
  import RunButton from '$lib/components/Toolbar/RunButton.svelte';
  import FormatSelector from '$lib/components/Toolbar/FormatSelector.svelte';
  import ShareButton from '$lib/components/Toolbar/ShareButton.svelte';
  import SaveButton from '$lib/components/Toolbar/SaveButton.svelte';
  import HistoryButton from '$lib/components/Toolbar/HistoryButton.svelte';

  // ... component code
</script>

<div class="toolbar">
  <div class="toolbar-left">
    <RunButton
      disabled={!activeTabData.editorText || activeTabData.isExecuting}
      loading={activeTabData.isExecuting}
      on:click={() => executeQuery(tabsState.activeTabId)}
    />
  </div>

  <div class="toolbar-right">
    <FormatSelector bind:selected={activeTabData.resultFormat} />
    <ShareButton query={activeTabData.editorText} endpoint={activeTabData.endpoint} />
    <SaveButton
      query={activeTabData.editorText}
      endpoint={activeTabData.endpoint}
      on:save={(e) => saveQuery(tabsState.activeTabId, e.detail)}
    />
    <HistoryButton
      on:select={(e) => loadQueryFromHistory(tabsState.activeTabId, e.detail)}
    />
  </div>
</div>
```

### Step 3: Add Endpoint Selection Per Tab

```typescript
interface TabData {
  id: string;
  name: string;
  editorText: string;
  endpoint: string; // Per-tab endpoint
  results: SparqlResults | null;
  resultFormat: ResultFormat;
  isExecuting: boolean;
  error: string | null;
}

// Endpoint selector in UI
<EndpointSelector
  bind:value={activeTabData.endpoint}
  on:change={() => onEndpointChange(tabsState.activeTabId)}
/>
```

### Step 4: Rename and Replace

```bash
# Rename old component (backup)
git mv src/SparqlQueryUI.svelte src/SparqlQueryUI.old.svelte
git mv src/lib/components/Tabs/QueryTabs.svelte src/lib/components/Tabs/QueryTabs.old.svelte

# Rename new component to production name
git mv src/lib/components/Tabs/TabsWithResults.svelte src/SparqlQueryUI.svelte

# Update all imports
# ... find and replace across codebase
```

### Step 5: Migrate Storybook Stories

Update all stories to use new component:

```typescript
// src/SparqlQueryUI.stories.ts
import SparqlQueryUI from './SparqlQueryUI.svelte'; // Now points to new component

export const DBpediaEndpoint: Story = {
  args: {
    defaultEndpoint: 'https://dbpedia.org/sparql',
    enableTabs: true, // ← Use new working implementation
    instanceId: 'dbpedia',
  },
};

// ... migrate all other stories
```

### Step 6: Integration Testing

Run full test suite:

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (Storybook)
npm run test:e2e:storybook

# Build
npm run build

# Storybook build
npm run build-storybook
```

**Expected**: All 687+ tests pass, including new tab tests.

### Step 7: Create Migration Guide

Document the fix for future reference:

**Create `docs/TAB-SWITCHING-FIX.md`**:

```markdown
# Tab Switching Fix - Root Cause and Solution

## Root Cause

[Document which approach (A/B/C) worked and why]

## The Bug

[Explain exactly what was causing the tab switching to fail]

## The Solution

[Document the fix with code examples]

## Migration Notes

[How to apply this pattern to other components with similar reactivity]
```

## Testing Checklist

### Functional Tests
- [ ] Can create/close tabs
- [ ] Tab switching preserves editor content
- [ ] Tab switching preserves results
- [ ] Real SPARQL queries execute
- [ ] Results download in all formats
- [ ] Endpoint selection per tab works
- [ ] Share button generates correct URLs
- [ ] Save/load from history works
- [ ] localStorage persists tab state

### Integration Tests
- [ ] All existing integration tests pass
- [ ] New tab integration tests pass (from Tasks 01-04)

### E2E Tests
- [ ] All E2E tests pass (Storybook + Playwright)
- [ ] Tab switching test passes consistently

### Performance Tests
- [ ] Large datasets (10K+ rows) render without freezing
- [ ] Rapid tab switching doesn't cause memory leaks
- [ ] Storybook doesn't freeze when navigating stories

### Build Tests
- [ ] `npm run build` succeeds with 0 errors/warnings
- [ ] `npm run build-storybook` succeeds
- [ ] Bundle size is reasonable (< 1.2MB gzipped)

## Success Metrics

**This task is successful when:**

✅ **All 687+ tests pass** (unit + integration + E2E)
✅ **Tab switching works** in all Storybook stories
✅ **No Storybook freezing** when navigating or interacting
✅ **Production build succeeds** with zero errors/warnings
✅ **Documentation complete** explaining the fix

## Rollback Plan

If the new component has unforeseen issues:

```bash
# Restore old component
git mv src/SparqlQueryUI.svelte src/SparqlQueryUI.new.svelte
git mv src/SparqlQueryUI.old.svelte src/SparqlQueryUI.svelte

# Restore old tabs
git mv src/lib/components/Tabs/QueryTabs.old.svelte src/lib/components/Tabs/QueryTabs.svelte

# Revert story changes
git checkout HEAD -- src/SparqlQueryUI.stories.ts
```

## Commit Strategy

Make commits at each milestone:

1. `feat(tabs): Wire up real SPARQL execution to rebuilt tabs`
2. `feat(tabs): Add all toolbar features to rebuilt component`
3. `refactor(tabs): Replace old SparqlQueryUI with working implementation`
4. `docs(tabs): Add tab switching fix documentation`
5. `test(tabs): Verify all tests pass with new implementation`

## Final Verification

Before closing this task:

1. Run `npm run build` - Must pass
2. Run `npm test` - All tests pass
3. Run `npm run storybook` - Manually test all stories
4. Check browser console - No errors or warnings
5. Test in production build (`npm run preview`)
6. Create PR with detailed explanation of fix

## Documentation

Create these files:

- `docs/TAB-SWITCHING-FIX.md` - Root cause and solution
- `TAB-SWITCHING-ROOT-CAUSE.md` - Technical deep dive (from Task 03)
- Update `CHANGELOG.md` - Document the fix
- Update `README.md` - If any API changes

## Next Steps

After this task completes:

1. **Code Review**: Have another developer review the fix
2. **User Testing**: Test with real users on staging
3. **Performance Monitoring**: Monitor for any regressions
4. **Delete Old Files**: Remove `.old.svelte` backup files after verification period

## Notes

- Keep the old component files for 2 weeks as backup
- Monitor for any edge cases in production
- Document any additional reactivity patterns discovered
- Update style guide with reactive patterns to avoid/use
