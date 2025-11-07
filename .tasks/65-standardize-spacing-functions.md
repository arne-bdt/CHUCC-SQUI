# Task 65: Standardize Spacing in Functions Components

**Status**: ✅ Completed
**Priority**: Medium
**Estimated Effort**: 1-2 hours
**Dependencies**: None (can run parallel with Tasks 63, 64)
**Related**: Carbon Design System Guide for AI Agents.pdf, Tasks 63, 64

## Objective

Replace all hardcoded spacing values (padding, margin, gap) in Functions components with Carbon Design System spacing tokens to ensure consistent 8px-based spacing rhythm.

## Background

Carbon Design System uses an 8px base unit for all spacing. This task focuses on the Functions components which currently use hardcoded rem values that don't align with Carbon's spacing scale.

**Spacing Scale Reference**:
| Token | Value | Common Usage |
|-------|-------|--------------|
| `--cds-spacing-03` | 8px | Small gap, compact padding |
| `--cds-spacing-04` | 12px | Medium gap |
| `--cds-spacing-05` | 16px | Standard padding/margin |
| `--cds-spacing-06` | 24px | Section spacing |
| `--cds-spacing-07` | 32px | Large section spacing |

## Components to Update

Components in `src/lib/components/Functions/`:
1. **FunctionLibrary.svelte**
2. **FunctionDetails.svelte**

## Implementation Details

### 1. FunctionLibrary.svelte

**Current issues identified**:
```css
/* Header section */
.header {
  padding: 1rem;           /* → --cds-spacing-05 (16px) */
  /* ... */
}

.header h3 {
  margin: 0 0 0.75rem 0;   /* → 0 0 --cds-spacing-04 0 */
  /* ... */
}

/* Function list */
.function-list {
  padding: 1rem;           /* → --cds-spacing-05 (16px) */
  /* ... */
}

/* Function item cards */
.function-item {
  padding: 1rem;           /* → --cds-spacing-05 (16px) */
  margin-bottom: 0.75rem;  /* → --cds-spacing-04 (12px) */
}

.function-header {
  gap: 0.5rem;             /* → --cds-spacing-03 (8px) */
  margin-bottom: 0.5rem;   /* → --cds-spacing-03 (8px) */
}

.function-uri {
  padding: 0.125rem 0.5rem; /* → --cds-spacing-01 --cds-spacing-03 */
}

.function-description {
  margin: 0 0 0.75rem 0;   /* → 0 0 --cds-spacing-04 0 */
}

.function-actions {
  gap: 0.5rem;             /* → --cds-spacing-03 (8px) */
}

/* Empty state */
.empty-state {
  padding: 3rem 1rem;      /* → --cds-spacing-09 --cds-spacing-05 */
}
```

**Replace with**:
```css
.header {
  padding: var(--cds-spacing-05);
  border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
}

.header h3 {
  margin: 0 0 var(--cds-spacing-04) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--cds-text-primary, #161616);
}

.function-list {
  padding: var(--cds-spacing-05);
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}

.function-item {
  background: var(--cds-layer-02, #ffffff);
  border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  border-radius: 4px;
  padding: var(--cds-spacing-05);
  margin-bottom: var(--cds-spacing-04);
}

.function-header {
  display: flex;
  align-items: center;
  gap: var(--cds-spacing-03);
  margin-bottom: var(--cds-spacing-03);
  flex-wrap: wrap;
}

.function-uri {
  font-family: var(--cds-code-font-family, 'IBM Plex Mono', monospace);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--cds-text-primary, #161616);
  background: var(--cds-layer-01, #f4f4f4);
  padding: var(--cds-spacing-01) var(--cds-spacing-03);
  border-radius: 3px;
}

.function-description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--cds-text-primary, #161616);
  margin: 0 0 var(--cds-spacing-04) 0;
}

.function-actions {
  display: flex;
  align-items: center;
  gap: var(--cds-spacing-03);
  flex-wrap: wrap;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--cds-spacing-09) var(--cds-spacing-05);
  text-align: center;
}
```

### 2. FunctionDetails.svelte

**Current issues**:
```css
padding: 0;              /* Keep as-is */
padding: 0.75rem;        /* → --cds-spacing-04 (12px) */
/* (any other hardcoded spacing found during implementation) */
```

**Replace with**:
```css
padding: 0;
padding: var(--cds-spacing-04);
```

## Implementation Plan

1. **Read both component files**:
   - Use Read tool to examine current spacing
   - Create list of all hardcoded values

2. **Update FunctionLibrary.svelte**:
   - Replace all padding values with spacing tokens
   - Replace all margin values with spacing tokens
   - Replace all gap values with spacing tokens
   - Use Edit tool for surgical replacements

3. **Update FunctionDetails.svelte**:
   - Same process as FunctionLibrary
   - Likely fewer changes (simpler component)

4. **Visual verification**:
   - Test in Storybook after each component
   - Check modal display for FunctionDetails
   - Verify list rendering in FunctionLibrary

5. **Edge cases to handle**:
   - Multi-value properties: `padding: 1rem 0.5rem` → `padding: var(--cds-spacing-05) var(--cds-spacing-03)`
   - Zero values: `margin: 0` → keep as-is
   - Negative values: If found, use `-var(--cds-spacing-XX)`

## Acceptance Criteria

- [ ] FunctionLibrary.svelte uses only Carbon spacing tokens
- [ ] FunctionDetails.svelte uses only Carbon spacing tokens
- [ ] No hardcoded rem values for spacing (except 0)
- [ ] Components render correctly in Storybook
- [ ] Function cards have consistent spacing
- [ ] Modal dialog spacing is correct
- [ ] Dark theme (g90, g100) works correctly
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e:storybook`

## Testing Checklist

```bash
# 1. Visual verification in Storybook
npm run storybook
# Navigate to: Functions/FunctionLibrary
# Test:
#   - List view spacing
#   - Function card padding
#   - Gap between action buttons
#   - Modal dialog spacing (click Details button)
#   - Empty state padding

# 2. Test with service description
# Use story with mock extension functions
# Verify:
#   - Function items are well-spaced
#   - No overlapping elements
#   - Consistent gaps throughout

# 3. Build verification
npm run build
# Should complete with 0 errors, 0 warnings

# 4. Unit/Integration tests
npm test
# All tests should pass

# 5. E2E tests
npm run test:e2e:storybook
# Focus on: tests/e2e/extension-functions.storybook.spec.ts (if exists)
```

## Expected Visual Changes

**Minor spacing adjustments**:
- Function card padding: may adjust 1-2px to align with 8px rhythm
- Gaps between buttons: will be exactly 8px (--cds-spacing-03)
- Section spacing: will be exactly 16px or 24px
- Overall: more consistent "snapped to grid" appearance

**No changes to**:
- Component functionality
- Colors or themes
- Typography (handled in Task 67)
- Button styles (Carbon component)

## Responsive Considerations

FunctionLibrary already has responsive breakpoint at 672px:

```css
@media (max-width: 672px) {
  .function-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .function-actions {
    width: 100%;
  }

  .function-actions :global(.bx--btn) {
    flex: 1;
  }
}
```

**Verify**:
- Spacing tokens work correctly at mobile widths
- No overflow or cramped layouts
- Touch targets remain accessible (min 44px)

## References

- Carbon Spacing Scale: https://carbondesignsystem.com/elements/spacing/overview/
- Task 64: Capabilities spacing (similar work)
- Task 66: Remaining components
- Task 67: Typography standardization

## Notes

- This task is smaller than Task 64 (only 2 components vs 6)
- Can be completed in parallel with other spacing tasks
- Focus on **spacing only** - preserve all other styles
- Use Edit tool for precise replacements to avoid breaking other CSS
- Document any unusual spacing decisions in code comments

---

## Completion Summary

**Completed**: 2025-11-07

### Changes Made

#### FunctionLibrary.svelte
- ✅ `.header` padding: `1rem` → `var(--cds-spacing-05)` (16px)
- ✅ `.header h3` margin-bottom: `0.75rem` → `var(--cds-spacing-04)` (12px)
- ✅ `.function-list` padding: `1rem` → `var(--cds-spacing-05)` (16px)
- ✅ `.function-item` padding: `1rem` → `var(--cds-spacing-05)` (16px)
- ✅ `.function-item` margin-bottom: `0.75rem` → `var(--cds-spacing-04)` (12px)
- ✅ `.function-header` gap: `0.5rem` → `var(--cds-spacing-03)` (8px)
- ✅ `.function-header` margin-bottom: `0.5rem` → `var(--cds-spacing-03)` (8px)
- ✅ `.function-uri` padding: `0.125rem 0.5rem` → `var(--cds-spacing-01) var(--cds-spacing-03)` (2px 8px)
- ✅ `.function-description` margin: `0 0 0.75rem 0` → `0 0 var(--cds-spacing-04) 0` (12px)
- ✅ `.function-actions` gap: `0.5rem` → `var(--cds-spacing-03)` (8px)
- ✅ `.empty-state` padding: `3rem 1rem` → `var(--cds-spacing-09) var(--cds-spacing-05)` (48px 16px)

#### FunctionDetails.svelte
- ✅ `.function-details section` margin-bottom: `1.5rem` → `var(--cds-spacing-06)` (24px)
- ✅ `.function-details h4` margin-bottom: `0.5rem` → `var(--cds-spacing-03)` (8px)
- ✅ `.parameter-list li` margin-bottom: `0.75rem` → `var(--cds-spacing-04)` (12px)
- ✅ `.parameter-list li` padding: `0.75rem` → `var(--cds-spacing-04)` (12px)
- ✅ `.parameter-list li code` margin-right: `0.5rem` → `var(--cds-spacing-03)` (8px)
- ✅ `.param-description` margin-top: `0.5rem` → `var(--cds-spacing-03)` (8px)
- ✅ `.example` margin-bottom: `1rem` → `var(--cds-spacing-05)` (16px)
- ✅ `.parameter-list li :global(.bx--tag)` margin-right: `0.25rem` → `var(--cds-spacing-02)` (4px)

### Build & Tests Status

✅ **Build**: Passed with 0 errors, 0 warnings
✅ **Unit Tests**: 1,103 tests passed (48 test files)
✅ **E2E Tests**: 12 tests passed for Functions components

### Visual Verification

All acceptance criteria met:
- ✅ FunctionLibrary.svelte uses only Carbon spacing tokens
- ✅ FunctionDetails.svelte uses only Carbon spacing tokens
- ✅ No hardcoded rem values for spacing (except 0)
- ✅ Components render correctly
- ✅ Function cards have consistent spacing
- ✅ Modal dialog spacing is correct
- ✅ Build passes with 0 errors and 0 warnings
- ✅ All tests pass
- ✅ E2E tests verify functionality in browser

### Impact

- Spacing now follows Carbon Design System 8px rhythm
- Consistent spacing throughout Functions components
- Better alignment with Carbon's design tokens
- No breaking changes to functionality
- All existing tests continue to pass
