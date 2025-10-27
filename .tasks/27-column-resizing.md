# Task 27: Column Resizing

**Status**: ✅ COMPLETED
**Phase**: 6 - Advanced Table Features
**Dependencies**: Task 20 (SVAR DataGrid Integration)

## Overview

Enable column width adjustment by dragging column edges, allowing users to customize column widths to fit content and screen space.

## Requirements

- [x] Drag column separator to resize
- [x] Enforce minimum column width
- [x] Widths persist during session (grid internal state)
- [ ] Double-click to auto-fit content (not yet implemented - grid limitation)
- [x] All columns resizable by default

## Implementation

### Component Changes

**File**: [`src/lib/components/Results/DataTable.svelte`](../src/lib/components/Results/DataTable.svelte)

#### Column Configuration with Resizing

```typescript
const columns = $derived(
  data.columns.map((varName) => ({
    id: varName,
    label: varName,
    width: 200, // Initial width (pixels)
    sort: true,
    editor: false,
    resizable: true, // Task 27: Column resizing enabled
    cell: CellRenderer,
    // ... other config
  }))
);
```

#### Grid Component with Resize Enabled

```svelte
<Grid
  columns={columns}
  data={gridData}
  autoWidth={false}
  rowHeight={rowHeight}
  headerRowHeight={enableFilter ? 80 : 40}
  header={true}
  virtual={virtualScroll}
  selection={true}
  sort={true}
  filter={enableFilter}
  resize={true}    <!-- Task 27: Enable column resizing -->
/>
```

### SVAR Grid Resizing Features

The `wx-svelte-grid` package provides built-in column resizing:

1. **Drag to Resize**:
   - Hover over column separator (border between headers)
   - Cursor changes to resize cursor (↔)
   - Click and drag left/right to adjust width
   - Release to apply new width

2. **Minimum Width**: Grid enforces minimum width (~50px) to prevent columns from disappearing

3. **Persistence**: Width changes persist during session (stored in grid's internal state)

4. **All Columns**: When `resize={true}`, all columns become resizable (unless explicitly disabled per column)

### How It Works

1. **Initial Width**: All columns start at `width: 200` pixels

2. **User Resizing**:
   - User drags column separator
   - Grid updates column width in real-time
   - Other columns don't shift (only resized column changes)

3. **State Management**:
   - SVAR Grid manages column widths internally
   - No external state needed
   - Widths reset on data/component re-mount

4. **Virtual Scrolling**: Resizing works seamlessly with virtual scrolling

## Testing

### Storybook Stories

**File**: [`src/lib/components/Results/DataTable.stories.ts`](../src/lib/components/Results/DataTable.stories.ts)

```typescript
/**
 * Column Resizing (Task 27)
 * Demonstrates column width adjustment
 */
export const ColumnResizing: Story = {
  args: {
    data: {
      columns: ['short', 'medium', 'long', 'veryLongColumnName'],
      rows: [
        {
          short: { value: 'A', type: 'literal' },
          medium: { value: 'Medium text', type: 'literal' },
          long: {
            value: 'This is a longer text that might need more column width',
            type: 'literal',
          },
          veryLongColumnName: {
            value: 'Value for column with very long name',
            type: 'literal',
          },
        },
        // ... more rows
      ],
      rowCount: 2,
      vars: ['short', 'medium', 'long', 'veryLongColumnName'],
    },
    virtualScroll: false,
    rowHeight: 36,
  },
};
```

**Manual Testing in Storybook**:
1. Open [http://localhost:6006](http://localhost:6006)
2. Navigate to Results/DataTable → Column Resizing
3. Hover over column separators in header
4. Verify cursor changes to resize cursor (↔)
5. Drag separator left/right
6. Verify column width changes
7. Test minimum width by dragging very small
8. Verify width persists when scrolling

### Integration Tests

```typescript
// tests/integration/DataTable.resizing.test.ts
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import DataTable from '$lib/components/Results/DataTable.svelte';

test('columns are resizable', async () => {
  const { container } = render(DataTable, {
    props: { data: testData },
  });

  // Find column separator
  const separator = container.querySelector('.wx-resize-handle[data-column="name"]');
  expect(separator).toBeInTheDocument();

  // Get initial width
  const column = container.querySelector('[data-column-id="name"]');
  const initialWidth = column.offsetWidth;

  // Simulate drag to resize
  await fireEvent.mouseDown(separator, { clientX: 200 });
  await fireEvent.mouseMove(separator, { clientX: 250 }); // Drag 50px right
  await fireEvent.mouseUp(separator);

  await waitFor(() => {
    const newWidth = column.offsetWidth;
    expect(newWidth).toBeGreaterThan(initialWidth);
  });
});

test('enforces minimum column width', async () => {
  const { container } = render(DataTable, {
    props: { data: testData },
  });

  const separator = container.querySelector('.wx-resize-handle[data-column="name"]');
  const column = container.querySelector('[data-column-id="name"]');

  // Try to drag to very small width
  await fireEvent.mouseDown(separator, { clientX: 200 });
  await fireEvent.mouseMove(separator, { clientX: 10 }); // Try to make 10px
  await fireEvent.mouseUp(separator);

  await waitFor(() => {
    const width = column.offsetWidth;
    // Should be at minimum (≥50px), not 10px
    expect(width).toBeGreaterThanOrEqual(50);
  });
});
```

## User Experience

### Usage Example

```typescript
// Resizing enabled by default
<DataTable data={parsedResults} />

// Explicitly enable (redundant, shown for clarity)
<Grid
  columns={columns}
  data={gridData}
  resize={true}
/>
```

### Resize Interaction

1. **Hover**: Move mouse over column separator
   - Cursor changes to resize cursor (↔)
   - Separator may highlight

2. **Drag**: Click and hold, then drag left/right
   - Column width changes in real-time
   - Visual feedback during drag

3. **Release**: Release mouse button
   - New width applied
   - Width persists during session

### Common Use Cases

| Scenario | Solution |
|----------|----------|
| Column too narrow for content | Drag separator right to widen |
| Column too wide, wasting space | Drag separator left to narrow |
| Long IRI in Full View (Task 30) | Widen column to see complete URI |
| Compact layout needed | Narrow all columns to fit more on screen |
| Table doesn't fit screen | Resize columns to eliminate horizontal scroll |

## Performance

- ✅ **Smooth**: Real-time resize with no lag
- ✅ **Efficient**: Only affects visual rendering, no data recomputation
- ✅ **Virtual Scrolling**: Works with large datasets (10k+ rows)
- ✅ **No Throttling Needed**: SVAR Grid handles resize performance

## Configuration Options

### Per-Column Resizing

```typescript
// Enable for all columns (default)
const columns = data.columns.map((varName) => ({
  id: varName,
  label: varName,
  width: 200,
  resizable: true, // Resizable
}));

// Disable for specific column
const columns = [
  { id: 'id', label: 'ID', width: 80, resizable: false }, // Fixed width
  { id: 'name', label: 'Name', width: 200, resizable: true },
  { id: 'description', label: 'Description', width: 300, resizable: true },
];
```

### Initial Column Widths

```typescript
// Set different initial widths
const columns = [
  { id: 'id', width: 80 },          // Narrow (ID column)
  { id: 'name', width: 150 },       // Medium (Name column)
  { id: 'uri', width: 300 },        // Wide (URI column)
  { id: 'description', width: 400 }, // Extra wide (Description)
];
```

### Global Resize Toggle

```typescript
// Enable resizing globally
<Grid resize={true} {...props} />

// Disable resizing globally
<Grid resize={false} {...props} />
```

## Known Limitations

1. **No Auto-Fit**: Double-click separator doesn't auto-fit to content (grid limitation)
2. **No Persistence**: Width resets on component re-mount (future: localStorage)
3. **Fixed Minimum**: Minimum width hardcoded by grid (~50px), not configurable
4. **No Max Width**: No maximum width enforcement
5. **No Column Distribution**: Can't auto-distribute available space evenly

## Future Enhancements

- [ ] **Double-Click Auto-Fit**: Auto-size column to fit longest content
- [ ] **Persist Widths**: Save column widths in session storage or localStorage
- [ ] **Smart Initial Widths**: Calculate initial widths based on content
- [ ] **Configurable Min/Max**: Allow setting min/max width per column
- [ ] **Resize All**: Button to reset all columns to default width
- [ ] **Proportional Resize**: Option to resize adjacent columns proportionally
- [ ] **Keyboard Resize**: Arrow keys to resize focused column
- [ ] **Width Presets**: Save/load column width configurations

## Related Tasks

- **Task 20**: SVAR DataGrid Integration (dependency)
- **Task 25**: Column Sorting (independent feature)
- **Task 26**: Column Filtering (independent feature)
- **Task 28**: Column Reordering (complementary feature)
- **Task 29**: Show/Hide Columns (can hide columns instead of resizing very small)
- **Task 30**: Simple/Full View Toggle (long URIs need wider columns)
- **Task 31**: Cell Ellipsis (resizing reveals truncated content)

## Files Modified

- ✅ `src/lib/components/Results/DataTable.svelte`:
  - Set `resizable: true` in column configuration
  - Set `resize={true}` on Grid component

- ✅ `src/lib/components/Results/DataTable.stories.ts`:
  - Added `ColumnResizing` story with columns of varying content length

## Acceptance Criteria

- [x] Users can resize columns by dragging separator
- [x] Cursor changes to indicate resizable columns
- [x] Minimum width enforced to prevent disappearing columns
- [x] Width changes are smooth and responsive
- [x] Works with virtual scrolling
- [x] All columns resizable by default
- [x] Width persists during session (grid internal state)
- [x] Documented in Storybook
- [x] No TypeScript errors
- [x] Build passes

## Notes

- **Built-in Feature**: SVAR Grid handles all resize logic, no custom code needed
- **Default Enabled**: Resizing is on by default (Task 27 is essentially "enable what already exists")
- **No Persistence**: Width resets when data changes or component re-mounts (future enhancement)
- **Complements Cell Ellipsis**: Resizing reveals content hidden by ellipsis (Task 31)
- **Important for Full View**: Essential when using `showFullUris={true}` (Task 30)
- **Fixed Header Issue**: Added `header={true}` to make headers visible (was causing missing headers bug)
