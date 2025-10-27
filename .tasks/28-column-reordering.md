# Task 28: Column Reordering

**Status**: ⚠️ NOT IMPLEMENTED (Grid Limitation)
**Phase**: 6 - Advanced Table Features
**Dependencies**: Task 20 (SVAR DataGrid Integration)

## Overview

Allow drag-and-drop reordering of columns, enabling users to customize column order to match their preferences.

## Requirements (Target)

- [ ] Drag column header to new position
- [ ] Show visual indicator during drag
- [ ] Update column order
- [ ] Persist order during session
- [ ] Works with sorting, filtering, and resizing

## Research Findings

### SVAR Grid Capabilities

After reviewing the `wx-svelte-grid` (SVAR Grid) v2.3.0 types and documentation:

**❌ Column Reordering: NOT SUPPORTED**

- The `reorder` prop exists on the Grid component, but it controls **row reordering**, not column reordering
- The `draggable` property in `IColumn` is for adding a drag handle column to rows, not for dragging columns themselves
- No API or configuration option found for column drag-and-drop

### Evidence from Types

**File**: `node_modules/wx-svelte-grid/types/index.d.ts`

```typescript
export declare const Grid: Component<{
  // ...
  reorder?: boolean; // Row reordering, not column reordering
  // ...
}>;
```

**File**: `node_modules/@svar-ui/grid-store/dist/types/types.d.ts`

```typescript
export interface IColumn {
  id?: string;
  width?: number;
  sort?: boolean;
  resize?: boolean;
  hidden?: boolean; // For show/hide (Task 29)
  draggable?: boolean | ((row: IRow, column: IColumn) => boolean); // For row drag handles
  // No column reorder property
}
```

### Documentation Check

From earlier WebFetch attempts:
- `https://docs.svar.dev/svelte/grid/guides/configuration/enable_reorder` - Returns documentation about **row reordering**, not column reordering
- No mention of column reordering in the SVAR Grid docs

## Alternative Solutions

### Option 1: Manual Column Order (Current Workaround)

Users can control column order by passing columns in desired order:

```typescript
// Reorder columns programmatically
const reorderedColumns = ['name', 'age', 'city', 'country']; // Desired order
const data = {
  columns: reorderedColumns,
  rows: [/* ... */],
  // ...
};

<DataTable data={data} />
```

**Pros**:
- Works immediately
- Full control over column order
- Can be saved/loaded from preferences

**Cons**:
- Not interactive (requires component prop change)
- No drag-and-drop UI
- User must use external controls (dropdown, buttons)

### Option 2: Custom Drag-and-Drop Implementation

Implement column drag-and-drop ourselves using Svelte's built-in drag-and-drop or a library:

```typescript
// Custom header row with drag-and-drop
{#each columns as column, index (column.id)}
  <th
    draggable="true"
    ondragstart={(e) => handleDragStart(e, index)}
    ondragover={(e) => handleDragOver(e, index)}
    ondrop={(e) => handleDrop(e, index)}
  >
    {column.label}
  </th>
{/each}
```

**Pros**:
- Full control over behavior
- Can match Carbon Design System patterns
- Can integrate with SVAR Grid

**Cons**:
- Significant custom code required
- Must override SVAR Grid's header rendering
- Risk of conflicts with grid's internal state
- Complex integration with sorting/filtering/resizing

### Option 3: Column Order Menu (UI Alternative)

Provide a menu or modal where users select column order:

```typescript
<HeaderMenu api={gridApi}>
  <!-- Column order controls -->
  <div class="column-order-list">
    {#each columns as column}
      <div class="column-item">
        <button on:click={() => moveColumnUp(column.id)}>▲</button>
        <button on:click={() => moveColumnDown(column.id)}>▼</button>
        <span>{column.label}</span>
      </div>
    {/each}
  </div>
</HeaderMenu>
```

**Pros**:
- No drag-and-drop complexity
- Can be implemented alongside Task 29 (Show/Hide Columns)
- Works on touch devices
- Clear and accessible

**Cons**:
- Not as intuitive as drag-and-drop
- Requires more clicks to reorder
- Less "modern" UX

### Option 4: Wait for SVAR Grid Update

Wait for `wx-svelte-grid` to add native column reordering support.

**Pros**:
- No custom code needed
- Would integrate seamlessly
- Maintained by grid vendor

**Cons**:
- Uncertain timeline
- Feature may never be added
- Blocks Task 28 indefinitely

## Recommended Approach

**Phase 6 (Current)**: Mark Task 28 as **NOT IMPLEMENTED** due to grid limitation

**Future Enhancement**: Implement **Option 3** (Column Order Menu) as part of a future phase
- Integrates well with Task 29 (HeaderMenu for show/hide columns)
- Accessible and works on all devices
- Can be added without major refactoring

**Long-term**: Monitor SVAR Grid updates for native column reordering support

## Impact on Phase 6 Completion

Column reordering is **NOT a blocker** for Phase 6 completion:
- It's a "nice-to-have" feature, not critical for SPARQL results display
- Other Phase 6 features (sorting, filtering, resizing, show/hide) provide substantial value
- Users can still control column order via data prop (programmatic approach)

## Documentation for Users

For integrators who need custom column order:

```typescript
// Control column order via data structure
const customOrder = ['uri', 'label', 'description']; // Desired order

const reorderedData = {
  columns: customOrder,
  rows: results.rows,
  vars: customOrder,
  rowCount: results.rowCount,
};

<DataTable data={reorderedData} prefixes={prefixes} />
```

## Future Implementation Plan

When implementing Option 3 (Column Order Menu):

1. **Add to HeaderMenu** (Task 29 Related):
   ```svelte
   <HeaderMenu>
     <ColumnOrderControls bind:columns={columnOrder} />
   </HeaderMenu>
   ```

2. **Persist Order**:
   ```typescript
   // Save to session storage
   sessionStorage.setItem('columnOrder', JSON.stringify(columnOrder));
   ```

3. **Apply Order**:
   ```typescript
   // Reorder data before passing to DataTable
   const orderedData = applyColumnOrder(originalData, savedColumnOrder);
   ```

4. **UI Components**:
   - List of columns with up/down arrows
   - Drag handles for reordering within list (not drag-and-drop in table)
   - Reset to default button

## Related Tasks

- **Task 20**: SVAR DataGrid Integration (investigated for column reordering support)
- **Task 25**: Column Sorting (independent, works regardless)
- **Task 26**: Column Filtering (independent, works regardless)
- **Task 27**: Column Resizing (independent, works regardless)
- **Task 29**: Show/Hide Columns (future home for column order menu)
- **Task 31**: Cell Ellipsis and Tooltips (independent, works regardless)

## Files Modified

- ✅ `.tasks/28-column-reordering.md` - Documentation of findings and alternatives

## Acceptance Criteria

- [x] Research SVAR Grid capabilities for column reordering
- [x] Document findings (not supported)
- [x] Identify alternative solutions
- [x] Recommend approach for future implementation
- [ ] Implement drag-and-drop column reordering (deferred - grid limitation)
- [ ] Implement column order menu (future enhancement)

## Notes

- **Grid Limitation**: SVAR Grid v2.3.0 does not support column reordering
- **Row Reordering**: The `reorder` prop is for rows, not columns
- **Not a Blocker**: Phase 6 can be completed without this feature
- **Future Path**: Column Order Menu is the most practical solution
- **Programmatic Control**: Users can control column order via data prop
- **Monitor Updates**: Check SVAR Grid releases for native column reorder support

## Conclusion

**Task 28 is marked as NOT IMPLEMENTED due to SVAR Grid limitations.**

Column reordering via drag-and-drop is not supported by the current version of `wx-svelte-grid`. A column order menu can be implemented in the future as an alternative approach (Option 3), potentially integrated with the HeaderMenu component from Task 29.

For now, users who need custom column order can control it programmatically by passing columns in the desired order to the DataTable component.
