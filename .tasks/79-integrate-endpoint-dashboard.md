# Task 79: Integrate Endpoint Dashboard with Main Query Interface

## Overview

Integrate the EndpointInfoSummary and EndpointDashboard components into the main SparqlQueryUI interface. This provides users with immediate access to endpoint information while composing queries.

## Motivation

### User Experience Goals

1. **Contextual Information**: Endpoint capabilities visible while writing queries
2. **Discovery**: Users can explore extension functions and dataset graphs
3. **Efficiency**: No need to navigate away from query editor
4. **Professional UX**: Matches quality of established SPARQL tools

### Current Limitations

- Endpoint capabilities hidden in separate Capabilities panel
- No quick access to dataset information (graph URIs for FROM clauses)
- Extension functions not discoverable while writing queries
- Users must remember endpoint features manually

## Requirements

### Integration Points

1. **Location**: Below EndpointSelector in main toolbar
2. **Behavior**: Collapses by default, expands on demand
3. **Auto-update**: Refreshes when endpoint changes
4. **Function Insertion**: Insert functions into query editor on click

### Component Hierarchy

```
SparqlQueryUI
├── Toolbar
│   ├── EndpointSelector
│   ├── EndpointInfoSummary (NEW)
│   │   └── EndpointDashboard (when expanded)
│   └── RunButton
├── SparqlEditor
└── ResultsPanel
```

### Props Flow

```typescript
// SparqlQueryUI passes:
endpointUrl → EndpointInfoSummary
onInsertFunction → EndpointDashboard → FunctionLibrary

// EndpointSelector emits:
onchange → Update endpointUrl → Trigger fetch in EndpointInfoSummary
```

## Implementation Details

### Step 1: Update SparqlQueryUI Component

**File**: `src/lib/components/SparqlQueryUI.svelte`

```svelte
<script lang="ts">
  import Toolbar from './Toolbar/Toolbar.svelte';
  import SparqlEditor from './Editor/SparqlEditor.svelte';
  import ResultsPanel from './Results/ResultsPanel.svelte';
  import EndpointInfoSummary from './Endpoint/EndpointInfoSummary.svelte';
  import EndpointDashboard from './Endpoint/EndpointDashboard.svelte';
  import { getQueryStore, getEndpointStore } from '../stores/storeContext';

  const queryStore = getQueryStore();
  const endpointStore = getEndpointStore();

  const queryState = $derived($queryStore);
  const currentEndpoint = $derived($endpointStore);

  // Handle function insertion from dashboard
  function handleInsertFunction(functionCall: string) {
    // Insert at cursor position in editor
    const currentQuery = queryState.text;
    const cursorPosition = queryState.cursorPosition || currentQuery.length;

    const before = currentQuery.substring(0, cursorPosition);
    const after = currentQuery.substring(cursorPosition);
    const newQuery = before + functionCall + after;

    queryStore.setText(newQuery);

    // Move cursor after inserted function
    queryStore.setCursorPosition(cursorPosition + functionCall.length);
  }
</script>

<div class="sparql-query-ui">
  <!-- Toolbar with endpoint selector -->
  <Toolbar />

  <!-- Endpoint Information Summary (NEW) -->
  {#if currentEndpoint}
    <EndpointInfoSummary endpointUrl={currentEndpoint}>
      <EndpointDashboard
        slot="dashboard"
        endpointUrl={currentEndpoint}
        onInsertFunction={handleInsertFunction}
      />
    </EndpointInfoSummary>
  {/if}

  <!-- Query Editor -->
  <SparqlEditor />

  <!-- Results Panel -->
  <ResultsPanel />
</div>

<style>
  .sparql-query-ui {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
</style>
```

### Step 2: Update Toolbar Component (Optional)

If EndpointSelector is in the Toolbar component, ensure it's exported properly:

**File**: `src/lib/components/Toolbar/Toolbar.svelte`

```svelte
<script lang="ts">
  import EndpointSelector from '../Endpoint/EndpointSelector.svelte';
  import RunButton from './RunButton.svelte';
  import { getEndpointStore } from '../../stores/storeContext';

  const endpointStore = getEndpointStore();
  let currentEndpoint = $state('');

  // Subscribe to endpoint changes
  $effect(() => {
    const unsubscribe = endpointStore.subscribe((value) => {
      currentEndpoint = value;
    });

    return () => {
      unsubscribe();
    };
  });

  function handleEndpointChange(url: string) {
    endpointStore.set(url);
    currentEndpoint = url;
  }
</script>

<div class="toolbar">
  <EndpointSelector
    bind:value={currentEndpoint}
    onchange={handleEndpointChange}
  />

  <RunButton />
</div>

<style>
  .toolbar {
    display: flex;
    gap: var(--cds-spacing-05);
    padding: var(--cds-spacing-05);
    background: var(--cds-layer-01);
    border-bottom: 1px solid var(--cds-border-subtle-01);
  }
</style>
```

### Step 3: Add Auto-fetch on Endpoint Change

Ensure EndpointInfoSummary triggers fetch when endpoint changes:

**File**: `src/lib/components/Endpoint/EndpointInfoSummary.svelte`

```svelte
<script lang="ts">
  // ... existing code ...

  // Auto-fetch when endpoint changes
  $effect(() => {
    if (endpointUrl && !state.descriptions.has(endpointUrl)) {
      serviceDescriptionStore.fetchForEndpoint(endpointUrl);
    }
  });
</script>
```

### Step 4: Update QueryStore for Cursor Position

Add cursor position tracking to query store:

**File**: `src/lib/stores/queryStore.ts`

```typescript
export interface QueryState {
  text: string;
  cursorPosition?: number; // NEW
  // ... existing fields ...
}

export function createQueryStore(initialQuery = '') {
  // ... existing code ...

  return {
    subscribe,

    // ... existing methods ...

    /**
     * Set cursor position
     * @param position Cursor position in query text
     */
    setCursorPosition(position: number): void {
      update((state) => ({
        ...state,
        cursorPosition: position,
      }));
    },

    /**
     * Get cursor position
     * @returns Current cursor position
     */
    getCursorPosition(): number | undefined {
      let position: number | undefined;
      update((state) => {
        position = state.cursorPosition;
        return state;
      });
      return position;
    },
  };
}
```

### Step 5: Update SparqlEditor to Track Cursor

**File**: `src/lib/components/Editor/SparqlEditor.svelte`

```svelte
<script lang="ts">
  import { EditorView } from '@codemirror/view';
  import { getQueryStore } from '../../stores/storeContext';

  const queryStore = getQueryStore();

  // ... existing code ...

  // Track cursor position changes
  function handleCursorChange(view: EditorView) {
    const position = view.state.selection.main.head;
    queryStore.setCursorPosition(position);
  }

  // Add to editor configuration
  const editorConfig = {
    // ... existing config ...
    updateListener: EditorView.updateListener.of((update) => {
      if (update.selectionSet) {
        handleCursorChange(update.view);
      }
      if (update.docChanged) {
        const text = update.state.doc.toString();
        queryStore.setText(text);
      }
    }),
  };
</script>
```

## Implementation Steps

### Step 1: Update Component Imports
1. Import EndpointInfoSummary and EndpointDashboard
2. Import necessary stores (queryStore, endpointStore)
3. Add handleInsertFunction callback

### Step 2: Integrate into UI
1. Add EndpointInfoSummary below Toolbar
2. Pass EndpointDashboard as dashboard slot
3. Wire up endpointUrl from store
4. Wire up onInsertFunction callback

### Step 3: Implement Function Insertion
1. Add cursor position tracking to query store
2. Update SparqlEditor to emit cursor changes
3. Implement handleInsertFunction in SparqlQueryUI
4. Test function insertion at different cursor positions

### Step 4: Test Auto-fetch
1. Change endpoint in selector
2. Verify EndpointInfoSummary fetches new description
3. Verify dashboard updates with new data

### Step 5: Update Storybook Stories
**File**: `src/lib/components/SparqlQueryUI.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/svelte';
import SparqlQueryUI from './SparqlQueryUI.svelte';
import { getServiceDescriptionStore } from '../stores/storeContext';

const meta = {
  title: 'Components/SparqlQueryUI',
  component: SparqlQueryUI,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<SparqlQueryUI>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockServiceDescription = {
  endpoint: 'http://dbpedia.org/sparql',
  supportedLanguages: [
    'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',
  ],
  features: [],
  resultFormats: ['application/sparql-results+json'],
  inputFormats: [],
  extensionFunctions: [
    {
      uri: 'http://example.org/fn/dateFormat',
      label: 'dateFormat',
      comment: 'Format date values',
    },
  ],
  extensionAggregates: [],
  datasets: [
    {
      namedGraphs: [
        {
          name: 'http://dbpedia.org/graph/en',
          metadata: { 'http://rdfs.org/ns/void#triples': 1234567 },
        },
      ],
      defaultGraphs: [],
    },
  ],
  lastFetched: new Date(),
  available: true,
};

export const Default: Story = {
  args: {},
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', mockServiceDescription],
      ]),
    }));
  },
};

export const WithEndpointInfo: Story = {
  args: {},
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      currentEndpoint: 'http://dbpedia.org/sparql',
      descriptions: new Map([
        ['http://dbpedia.org/sparql', mockServiceDescription],
      ]),
    }));
  },
};

export const EndpointInfoExpanded: Story = {
  args: {},
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      currentEndpoint: 'http://dbpedia.org/sparql',
      descriptions: new Map([
        ['http://dbpedia.org/sparql', mockServiceDescription],
      ]),
    }));

    // Note: Would need to programmatically expand EndpointInfoSummary
    // This could be done via a story decorator or play function
  },
};
```

### Step 6: Create Integration Tests
**File**: `tests/integration/EndpointDashboardIntegration.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SparqlQueryUI from '$lib/components/SparqlQueryUI.svelte';
import StoreProvider from '$lib/components/StoreProvider.svelte';

describe('EndpointDashboard Integration', () => {
  it('shows endpoint info summary when endpoint is selected', async () => {
    render(StoreProvider, {
      props: {
        initialEndpoint: 'http://dbpedia.org/sparql',
        children: SparqlQueryUI,
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/SPARQL 1.1/)).toBeInTheDocument();
    });
  });

  it('expands dashboard on click', async () => {
    const user = userEvent.setup();
    render(StoreProvider, {
      props: {
        initialEndpoint: 'http://dbpedia.org/sparql',
        children: SparqlQueryUI,
      },
    });

    // Find and click expand button
    const expandButton = await screen.findByLabelText('Show endpoint information');
    await user.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Capabilities')).toBeInTheDocument();
    });
  });

  it('inserts function into query editor', async () => {
    const user = userEvent.setup();
    render(StoreProvider, {
      props: {
        initialEndpoint: 'http://dbpedia.org/sparql',
        initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        children: SparqlQueryUI,
      },
    });

    // Expand dashboard
    const expandButton = await screen.findByLabelText('Show endpoint information');
    await user.click(expandButton);

    // Switch to Functions tab
    const functionsTab = await screen.findByRole('tab', { name: /Functions/ });
    await user.click(functionsTab);

    // Click insert button for a function
    const insertButton = await screen.findByText(/Insert/);
    await user.click(insertButton);

    // Verify function inserted into query
    await waitFor(() => {
      // This depends on FunctionLibrary implementation
      // Placeholder assertion
      expect(screen.getByText(/dateFormat/)).toBeInTheDocument();
    });
  });

  it('updates dashboard when endpoint changes', async () => {
    const user = userEvent.setup();
    render(StoreProvider, {
      props: {
        initialEndpoint: 'http://dbpedia.org/sparql',
        children: SparqlQueryUI,
      },
    });

    // Verify initial endpoint info
    await waitFor(() => {
      expect(screen.getByText(/DBpedia/i)).toBeInTheDocument();
    });

    // Change endpoint
    const selector = screen.getByLabelText('SPARQL Endpoint');
    await user.clear(selector);
    await user.type(selector, 'http://wikidata.org/sparql');

    // Verify new endpoint info loads
    await waitFor(() => {
      expect(screen.getByText(/Wikidata/i)).toBeInTheDocument();
    });
  });
});
```

### Step 7: Run Tests and Build
```bash
npm test                    # All tests must pass
npm run build               # Build must succeed
npm run lint                # No linting errors
npm run type-check          # No type errors
npm run storybook           # Manual visual verification
```

## Acceptance Criteria

### Component Integration
- ✅ EndpointInfoSummary appears below Toolbar
- ✅ Shows when endpoint is selected
- ✅ Hides when no endpoint
- ✅ Collapses by default
- ✅ Expands on click
- ✅ EndpointDashboard renders in dashboard slot

### Auto-fetch Behavior
- ✅ Fetches service description on mount (if not cached)
- ✅ Refetches when endpoint changes
- ✅ Shows loading state during fetch
- ✅ Shows error state on fetch failure
- ✅ Uses cached data when available

### Function Insertion
- ✅ Insert button appears for each function
- ✅ Clicking insert adds function to query
- ✅ Function inserted at cursor position
- ✅ Cursor moves after inserted function
- ✅ Works with empty query
- ✅ Works at beginning/middle/end of query

### Storybook Stories
- ✅ Default story shows basic UI
- ✅ WithEndpointInfo story shows summary
- ✅ EndpointInfoExpanded story shows dashboard
- ✅ All stories render without errors

### Integration Tests
- ✅ All tests pass
- ✅ Tests verify summary rendering
- ✅ Tests verify expand/collapse
- ✅ Tests verify function insertion
- ✅ Tests verify endpoint change

### Build & Quality Checks
```bash
npm run build               # ✅ 0 errors, 0 warnings
npm test                    # ✅ All tests pass
npm run lint                # ✅ No violations
npm run type-check          # ✅ No type errors
```

## Dependencies

**Prerequisite Tasks:**
- Task 78: Create EndpointInfoSummary component
- Task 78: Create EndpointDashboard component

**Next Tasks:**
- Task 79: Create E2E tests for endpoint dashboard workflow

## Troubleshooting

### Common Issues

**Issue**: EndpointInfoSummary not showing
**Solution**: Verify endpointStore has a value and component receives it

**Issue**: Function insertion not working
**Solution**: Check cursor position tracking in SparqlEditor

**Issue**: Dashboard not updating on endpoint change
**Solution**: Verify $effect in EndpointInfoSummary triggers fetch

**Issue**: Service description fetch fails
**Solution**: Check CORS settings and endpoint availability

## Future Enhancements

- **Keyboard Shortcuts**: Ctrl+I to toggle endpoint info
- **Persistent State**: Remember expanded/collapsed preference
- **Quick Copy**: Copy graph URIs to clipboard
- **Smart Suggestions**: Suggest using extension functions based on query
- **Inline Help**: Show function documentation on hover

## References

- **SparqlQueryUI**: `src/lib/components/SparqlQueryUI.svelte`
- **QueryStore**: `src/lib/stores/queryStore.ts`
- **EndpointStore**: `src/lib/stores/endpointStore.ts`
- **CodeMirror Selection API**: https://codemirror.net/docs/ref/#state.EditorSelection

---

**Previous Task**: [Task 78: Create EndpointDashboard Component](./78-endpoint-dashboard.md)
**Next Task**: [Task 79: E2E Tests for Endpoint Dashboard](./80-e2e-endpoint-dashboard.md)
