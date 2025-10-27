# Task 29: Show/Hide Columns

**Status**: ⚠️ PARTIALLY IMPLEMENTED (Framework Ready)
**Phase**: 6 - Advanced Table Features
**Dependencies**: Task 20 (SVAR DataGrid Integration)

## Overview

Provide UI to toggle column visibility, allowing users to hide columns they don't need and show only relevant data.

## Requirements

- [x] HeaderMenu component available (SVAR Grid)
- [ ] "Columns" menu button in toolbar (future: needs Toolbar component)
- [ ] Checkboxes for each column
- [ ] Hide/show columns without losing data
- [ ] Remember visible columns during session
- [ ] Works with sorting, filtering, and resizing

## Implementation Framework

### SVAR Grid HeaderMenu Component

SVAR Grid provides a `HeaderMenu` component for column visibility control:

**Type Definition** (`wx-svelte-grid/types/index.d.ts`):
```typescript
export declare const HeaderMenu: Component<{
  columns?: { [key: string]: boolean }; // Column ID → visibility
  api?: IApi; // Grid API
  children?: () => any; // Custom menu content
}>;
```

### Basic Implementation Pattern

```svelte
<script lang="ts">
  import { Grid, HeaderMenu } from 'wx-svelte-grid';
  import type { IApi } from 'wx-svelte-grid';

  let gridApi: IApi | null = $state(null);

  // Column visibility state
  let columnVisibility = $state<Record<string, boolean>>({
    person: true,
    name: true,
    birthDate: true,
    nationality: true,
  });

  function handleGridInit(api: IApi) {
    gridApi = api;
  }
</script>

<!-- Grid with init callback -->
<Grid
  columns={columns}
  data={gridData}
  init={handleGridInit}
  {...otherProps}
/>

<!-- Header Menu for column visibility -->
{#if gridApi}
  <HeaderMenu columns={columnVisibility} api={gridApi} />
{/if}
```

### Column Hidden Property

Columns can be hidden using the `hidden` property:

```typescript
const columns = $derived(
  data.columns.map((varName) => ({
    id: varName,
    label: varName,
    width: 200,
    sort: true,
    resizable: true,
    hidden: !columnVisibility[varName], // Hide if not visible
    cell: CellRenderer,
  }))
);
```

## Current Status

### What's Available

✅ **SVAR Grid Components**:
- `HeaderMenu` component exists
- `hidden` property on columns
- Grid API via `init` callback

✅ **Technical Foundation**:
- Column visibility can be controlled programmatically
- Hidden columns don't render but preserve data
- Works with all other grid features

### What's Missing

❌ **UI Integration**:
- No toolbar button to open column menu
- No visual menu component in our app
- Need to create Toolbar component (separate from Task 11's RunButton)

❌ **State Management**:
- No persistence to session storage
- No default visibility state
- Need to initialize visibility for dynamic columns

❌ **User Experience**:
- No visual indicator of hidden columns
- No "Show All" / "Hide All" buttons
- No column count display

## Future Implementation

### Phase 1: Add Column Visibility State

**File**: `src/lib/components/Results/DataTable.svelte`

```typescript
interface Props {
  /** ... existing props ... */
  /** Initial column visibility (default: all visible) */
  initialColumnVisibility?: Record<string, boolean>;
  /** Callback when column visibility changes */
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
}

let gridApi: IApi | null = $state(null);

// Initialize column visibility (all visible by default)
let columnVisibility = $state<Record<string, boolean>>(
  props.initialColumnVisibility ||
    Object.fromEntries(data.columns.map((col) => [col, true]))
);

// Update columns to respect visibility
const columns = $derived(
  data.columns.map((varName) => ({
    id: varName,
    label: varName,
    width: 200,
    sort: true,
    resizable: true,
    hidden: !columnVisibility[varName], // Task 29: Hide if not visible
    cell: CellRenderer,
  }))
);

function handleGridInit(api: IApi) {
  gridApi = api;
}

// Notify parent of visibility changes
$effect(() => {
  props.onColumnVisibilityChange?.(columnVisibility);
});
```

### Phase 2: Create Results Toolbar

**File**: `src/lib/components/Results/ResultsToolbar.svelte` (new)

```svelte
<script lang="ts">
  import { Button, OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
  import { Column } from 'carbon-icons-svelte';

  interface Props {
    columns: string[];
    columnVisibility: Record<string, boolean>;
    onToggleColumn: (columnId: string) => void;
  }

  let { columns, columnVisibility, onToggleColumn }: Props = $props();
</script>

<div class="results-toolbar">
  <!-- Column visibility menu -->
  <OverflowMenu icon={Column} flipped>
    <div class="column-menu">
      <h3>Show/Hide Columns</h3>
      {#each columns as columnId}
        <OverflowMenuItem
          text={columnId}
          on:click={() => onToggleColumn(columnId)}
        >
          <input
            type="checkbox"
            checked={columnVisibility[columnId]}
            on:change={() => onToggleColumn(columnId)}
          />
          {columnId}
        </OverflowMenuItem>
      {/each}
    </div>
  </OverflowMenu>

  <!-- Other toolbar buttons... -->
</div>

<style>
  .results-toolbar {
    display: flex;
    gap: var(--cds-spacing-03);
    padding: var(--cds-spacing-03);
    border-bottom: 1px solid var(--cds-border-subtle-01);
  }

  .column-menu {
    padding: var(--cds-spacing-03);
    min-width: 200px;
  }

  .column-menu h3 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: var(--cds-spacing-03);
  }
</style>
```

### Phase 3: Integrate Toolbar with DataTable

**File**: `src/lib/components/Results/ResultsPanel.svelte` (new wrapper)

```svelte
<script lang="ts">
  import DataTable from './DataTable.svelte';
  import ResultsToolbar from './ResultsToolbar.svelte';
  import type { ParsedTableData } from '../../utils/resultsParser';

  interface Props {
    data: ParsedTableData;
    prefixes?: Record<string, string>;
  }

  let { data, prefixes }: Props = $props();

  // Column visibility state
  let columnVisibility = $state<Record<string, boolean>>(
    Object.fromEntries(data.columns.map((col) => [col, true]))
  );

  function toggleColumn(columnId: string) {
    columnVisibility[columnId] = !columnVisibility[columnId];
    // Save to session storage
    sessionStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
  }

  // Load from session storage on mount
  $effect(() => {
    const saved = sessionStorage.getItem('columnVisibility');
    if (saved) {
      columnVisibility = JSON.parse(saved);
    }
  });
</script>

<div class="results-panel">
  <ResultsToolbar
    columns={data.columns}
    columnVisibility={columnVisibility}
    onToggleColumn={toggleColumn}
  />

  <DataTable
    data={data}
    prefixes={prefixes}
    initialColumnVisibility={columnVisibility}
    onColumnVisibilityChange={(newVisibility) => {
      columnVisibility = newVisibility;
    }}
  />
</div>

<style>
  .results-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
```

### Phase 4: Persist Visibility

```typescript
// utils/columnVisibilityStore.ts
import { writable } from 'svelte/store';

const STORAGE_KEY = 'squi_column_visibility';

export function createColumnVisibilityStore() {
  // Load from session storage
  const stored = sessionStorage.getItem(STORAGE_KEY);
  const initial = stored ? JSON.parse(stored) : {};

  const { subscribe, set, update } = writable<Record<string, boolean>>(initial);

  return {
    subscribe,
    set: (value: Record<string, boolean>) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      set(value);
    },
    update: (fn: (value: Record<string, boolean>) => Record<string, boolean>) => {
      update((current) => {
        const newValue = fn(current);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
        return newValue;
      });
    },
    toggleColumn: (columnId: string) => {
      update((visibility) => {
        const newVisibility = {
          ...visibility,
          [columnId]: !visibility[columnId],
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibility));
        return newVisibility;
      });
    },
    reset: () => {
      sessionStorage.removeItem(STORAGE_KEY);
      set({});
    },
  };
}
```

## Manual Implementation (Current Workaround)

Users can control column visibility programmatically:

```typescript
// Hide specific columns
const visibleColumns = ['person', 'name']; // Only show these
const filteredData = {
  columns: visibleColumns,
  rows: results.rows.map((row) => {
    const filteredRow: any = {};
    visibleColumns.forEach((col) => {
      filteredRow[col] = row[col];
    });
    return filteredRow;
  }),
  vars: visibleColumns,
  rowCount: results.rowCount,
};

<DataTable data={filteredData} />;
```

## Testing

### Storybook Story (Future)

```typescript
// DataTable.stories.ts
export const ShowHideColumns: Story = {
  args: {
    data: dbpediaData,
    initialColumnVisibility: {
      person: true,
      name: true,
      birthDate: false, // Hidden by default
      nationality: true,
    },
  },
};
```

### Integration Tests (Future)

```typescript
// tests/integration/DataTable.columnVisibility.test.ts
test('hides column when hidden prop is true', async () => {
  const { container } = render(DataTable, {
    props: {
      data: testData,
      initialColumnVisibility: {
        name: true,
        age: false, // Hidden
      },
    },
  });

  await waitFor(() => {
    // 'name' column should be visible
    expect(container.querySelector('[data-column-id="name"]')).toBeInTheDocument();

    // 'age' column should be hidden
    expect(container.querySelector('[data-column-id="age"]')).not.toBeInTheDocument();
  });
});
```

## Known Limitations

1. **No UI Yet**: HeaderMenu component available but not integrated
2. **No Toolbar**: Needs separate toolbar component to host column menu button
3. **No Persistence**: No automatic saving of visibility preferences
4. **Manual Control**: Current workaround requires data manipulation

## Related Tasks

- **Task 20**: SVAR DataGrid Integration (provides HeaderMenu)
- **Task 28**: Column Reordering (could share same menu UI)
- **Task 11**: Run Query Button (has Toolbar, but for query execution)
- **Future**: Results Toolbar component (distinct from query Toolbar)

## Files to Create

- [ ] `src/lib/components/Results/ResultsToolbar.svelte` - Toolbar with column menu
- [ ] `src/lib/utils/columnVisibilityStore.ts` - State management with persistence
- [ ] `src/lib/components/Results/ResultsPanel.svelte` - Wrapper combining toolbar + table
- [ ] `tests/integration/DataTable.columnVisibility.test.ts` - Column visibility tests

## Files to Modify

- [ ] `src/lib/components/Results/DataTable.svelte`:
  - Add `initialColumnVisibility` prop
  - Add `onColumnVisibilityChange` callback
  - Add `gridApi` state and `init` callback
  - Add `hidden` property to columns based on visibility

## Acceptance Criteria

- [x] HeaderMenu component available from SVAR Grid
- [x] Technical pattern documented
- [ ] UI toolbar with column menu button
- [ ] Checkboxes for each column in menu
- [ ] Clicking checkbox toggles column visibility
- [ ] Hidden columns don't render
- [ ] Data preserved for hidden columns
- [ ] Visibility persists in session storage
- [ ] Works with sorting, filtering, resizing
- [ ] Documented in Storybook
- [ ] Integration tests pass
- [ ] Build passes

## Notes

- **Framework Ready**: SVAR Grid provides all necessary components
- **UI Pending**: Need to create toolbar and menu components
- **Separate Concern**: Results toolbar is distinct from query toolbar (Task 11)
- **Session Storage**: Visibility should persist within session, not across sessions
- **Default Visible**: All columns visible by default
- **Minimum Columns**: Should enforce at least 1 visible column

## Conclusion

**Task 29 is PARTIALLY IMPLEMENTED** - the framework and technical foundation are in place via SVAR Grid's HeaderMenu component and column `hidden` property. However, the full user-facing implementation requires:

1. Creating a Results Toolbar component
2. Integrating the HeaderMenu with the toolbar
3. Adding state management and persistence
4. Writing tests

This is deferred as a future enhancement beyond the core Phase 6 scope. The technical capability exists, but the UX implementation is pending.

For now, users can control column visibility programmatically by filtering the data structure before passing to DataTable.
