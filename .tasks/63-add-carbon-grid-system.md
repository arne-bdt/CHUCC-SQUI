# Task 63: Add Carbon Grid System to Main Layout

**Status**: Open
**Priority**: High
**Estimated Effort**: 3-4 hours
**Dependencies**: None
**Related**: Carbon Design System Guide for AI Agents.pdf

## Objective

Implement Carbon's 2x Grid system in the main application layout to ensure consistent, responsive design that follows Carbon Design System principles. The grid should provide proper content containment, responsive column layout (16/8/4 columns), and consistent gutters.

## Background

The Carbon Design System uses a 2x Grid based on an 8px base unit with:
- **16 columns** at large breakpoints (≥1056px)
- **8 columns** at medium breakpoints (672px-1055px)
- **4 columns** at small breakpoints (<672px)
- **Base unit**: 8px for all sizing and spacing
- **Gutters**: 16px on narrow layouts, 32px on wide layouts
- **Max width**: 1584px (99rem) for content containers

Currently, the application doesn't use Carbon's grid structure, leading to:
- Content stretching full-width without max-width constraint
- Inconsistent responsive behavior
- Lack of standard column alignment

## Requirements

### 1. Add Grid Container to Main Component

Wrap the main application content in Carbon's grid structure:

```svelte
<div class="bx--grid bx--grid--full-width">
  <div class="bx--row">
    <div class="bx--col-lg-16 bx--col-md-8 bx--col-sm-4">
      <!-- Main content -->
    </div>
  </div>
</div>
```

**Files to modify**:
- `src/SparqlQueryUI.svelte` - Main component

**Implementation notes**:
- Use `bx--grid--full-width` for full viewport width with responsive padding
- Alternative: Use standard `bx--grid` with max-width: 99rem (1584px)
- Ensure QueryTabs, Toolbar, and SplitPane are inside grid structure
- Grid should NOT add vertical constraints (height: 100% on children)

### 2. Ensure Proper Content Padding

Add consistent side padding/margins using Carbon's spacing:

```css
.squi-container {
  /* Option 1: Let Carbon Grid handle padding */
  /* Grid classes apply responsive padding automatically */

  /* Option 2: Manual padding for edge cases */
  padding-left: var(--cds-spacing-05); /* 16px */
  padding-right: var(--cds-spacing-05); /* 16px */
}
```

**Breakpoint-specific padding**:
- Small (<672px): 16px side padding
- Medium (672px-1055px): 16px side padding
- Large (≥1056px): 32px side padding or centered max-width

### 3. Maintain Vertical Flex Layout

Grid should not interfere with existing vertical layout:

```css
.bx--grid {
  height: 100%;
}

.bx--row {
  height: 100%;
  flex-direction: column; /* Override default row direction */
}

.bx--col-lg-16 {
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

**Critical**: Ensure SplitPane continues to fill available vertical space.

### 4. Responsive Behavior

Test and verify grid behavior at breakpoints:

**Small screens (<672px)**:
- Toolbar stacks vertically (already implemented)
- Content spans full 4 columns
- Side padding: 16px

**Medium screens (672px-1055px)**:
- Content spans 8 columns
- Toolbar may wrap
- Side padding: 16px

**Large screens (≥1056px)**:
- Content spans 16 columns (or constrained to max-width)
- Toolbar horizontal layout
- Side padding: 32px

### 5. Alternative: CSS Grid Implementation

If Carbon's class-based grid is incompatible with Svelte 5, use CSS custom properties:

```css
.squi-container {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: var(--cds-spacing-05); /* 16px gutter */
  max-width: 99rem; /* 1584px */
  margin: 0 auto;
  padding: 0 var(--cds-spacing-07); /* 32px on large screens */
}

.squi-main-content {
  grid-column: 1 / -1; /* Span all columns */
}

@media (max-width: 1055px) {
  .squi-container {
    grid-template-columns: repeat(8, 1fr);
    padding: 0 var(--cds-spacing-05); /* 16px on medium screens */
  }
}

@media (max-width: 671px) {
  .squi-container {
    grid-template-columns: repeat(4, 1fr);
    padding: 0 var(--cds-spacing-05); /* 16px on small screens */
  }
}
```

## Implementation Plan

1. **Read Carbon Grid Documentation**:
   - Review: https://carbondesignsystem.com/elements/2x-grid/usage/
   - Check Carbon Svelte examples: https://github.com/carbon-design-system/carbon-components-svelte/issues/930

2. **Modify SparqlQueryUI.svelte**:
   - Add grid container wrapper
   - Apply responsive column classes
   - Test vertical flex layout compatibility

3. **Adjust Component Styles**:
   - Remove any hardcoded max-width or padding that conflicts with grid
   - Ensure children respect grid constraints
   - Update Toolbar, QueryTabs to work within grid

4. **Test Responsive Behavior**:
   - Test at 1920px, 1440px, 1024px, 768px, 375px widths
   - Verify toolbar wrapping
   - Verify split pane resizing
   - Check for horizontal scroll or overflow

5. **Update Storybook Stories**:
   - Add responsive viewports to stories
   - Document grid usage in component stories
   - Add Grid showcase story

## Acceptance Criteria

- [ ] Main layout uses Carbon Grid classes or equivalent CSS Grid
- [ ] Content is constrained to max-width: 99rem (1584px) on large screens
- [ ] Responsive column layout: 16/8/4 columns at respective breakpoints
- [ ] Consistent side padding: 32px (large), 16px (medium/small)
- [ ] No horizontal scroll at any standard viewport width
- [ ] Vertical flex layout preserved (SplitPane fills height)
- [ ] Toolbar and QueryTabs align within grid columns
- [ ] All existing functionality works (tabs, resizing, queries)
- [ ] Storybook stories render correctly with grid
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e:storybook`

## Testing Checklist

```bash
# 1. Visual testing
npm run storybook
# Navigate to SparqlQueryUI stories
# Test at viewports: 375px, 768px, 1024px, 1440px, 1920px
# Verify: no overflow, proper padding, centered content

# 2. Build verification
npm run build
# Should complete with 0 errors, 0 warnings

# 3. Unit/Integration tests
npm test
# All tests should pass

# 4. E2E tests
npm run test:e2e:storybook
# All tests should pass
```

## References

- Carbon Design System - 2x Grid: https://carbondesignsystem.com/elements/2x-grid/usage/
- IBM Design Language - 2x Grid: https://design-language-website.netlify.app/design/language/2x-grid/
- Carbon Svelte Grid Issue: https://github.com/carbon-design-system/carbon-components-svelte/issues/930
- Carbon Spacing Scale: https://carbondesignsystem.com/elements/spacing/overview/

## Notes

- This task focuses on **layout structure** only, not spacing within components
- Subsequent tasks will address component-level spacing standardization
- Grid should be transparent to end users - no visual changes, just improved consistency
- Consider adding CSS comments documenting grid usage for future developers
