# Task 02: Basic Layout Structure

**Phase:** Foundation
**Status:** DONE
**Completed:** 2025-10-25
**Dependencies:** 01
**Estimated Effort:** 3-4 hours

## Objective

Create the fundamental layout structure for the SQUI component with toolbar, editor pane, and results pane using Carbon Design System components.

## Requirements

Per specification section 5.1:
- Top toolbar for endpoint and execution controls
- Main area split into query editor (top) and results view (bottom)
- Resizable splitter between editor and results
- Responsive layout using Carbon grid/flexbox
- Proper spacing and alignment per Carbon guidelines

## Implementation Steps

1. Create `src/lib/components/Layout/SplitPane.svelte`:
   - Implement resizable splitter between two panes
   - Support vertical split (editor top, results bottom)
   - Persist splitter position in localStorage (optional for now)
   - Use Carbon spacing tokens

2. Update `src/SparqlQueryUI.svelte`:
   - Create main layout structure
   - Add placeholder divs for:
     - Toolbar (top)
     - Editor pane (middle-top)
     - Results pane (middle-bottom)
   - Integrate SplitPane component
   - Use Carbon Grid for responsive layout

3. Create `src/lib/components/Toolbar/Toolbar.svelte`:
   - Empty toolbar container with Carbon styling
   - Use Carbon's header/toolbar patterns
   - Proper height and spacing

4. Create placeholder components:
   - `src/lib/components/Editor/EditorPlaceholder.svelte`
   - `src/lib/components/Results/ResultsPlaceholder.svelte`

## Acceptance Criteria

- [ ] Layout renders with 3 distinct areas (toolbar, editor, results)
- [ ] Splitter can be dragged to resize editor/results panes
- [ ] Minimum heights are enforced (editor min 200px, results min 150px)
- [ ] Layout uses Carbon spacing and follows Carbon grid principles
- [ ] Layout is responsive (works on different viewport sizes)
- [ ] No layout shift or visual glitches when resizing

## Testing

1. Create `tests/unit/components/SplitPane.test.ts`:
   - Test splitter drag interaction
   - Test minimum height constraints
   - Test initial split ratio

2. Create `tests/integration/layout.test.ts`:
   - Test overall layout structure
   - Test responsive behavior
   - Test splitter persistence (if implemented)

## Files to Create/Modify

- `src/lib/components/Layout/SplitPane.svelte` (create)
- `src/lib/components/Toolbar/Toolbar.svelte` (create)
- `src/lib/components/Editor/EditorPlaceholder.svelte` (create)
- `src/lib/components/Results/ResultsPlaceholder.svelte` (create)
- `src/SparqlQueryUI.svelte` (modify)
- `tests/unit/components/SplitPane.test.ts` (create)
- `tests/integration/layout.test.ts` (create)

## Commit Message

```
feat: implement basic layout structure with resizable panes

- Add SplitPane component for editor/results split
- Create toolbar, editor, and results placeholders
- Implement drag-to-resize functionality
- Apply Carbon Design System spacing and grid
- Add layout tests
```

## Notes

- Use CSS Flexbox or Grid for layout
- Consider using `mousedown`, `mousemove`, `mouseup` events for splitter drag
- Apply `user-select: none` during drag to prevent text selection
- Use Carbon spacing tokens (`$spacing-05`, etc.) for margins/padding
