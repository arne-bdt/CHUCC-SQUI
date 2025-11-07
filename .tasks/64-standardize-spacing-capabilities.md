# Task 64: Standardize Spacing in Capabilities Components

**Status**: Open
**Priority**: Medium
**Estimated Effort**: 2-3 hours
**Dependencies**: None (can run parallel with Task 63)
**Related**: Carbon Design System Guide for AI Agents.pdf, Task 63

## Objective

Replace all hardcoded spacing values (padding, margin, gap) in Capabilities components with Carbon Design System spacing tokens to ensure consistent 8px-based spacing rhythm throughout the application.

## Background

Carbon Design System uses an 8px base unit for all spacing. The spacing scale provides tokens for consistent values:

| Token | Value | Usage |
|-------|-------|-------|
| `--cds-spacing-01` | 2px | Minimal spacing |
| `--cds-spacing-02` | 4px | Tight spacing |
| `--cds-spacing-03` | 8px | Default small gap |
| `--cds-spacing-04` | 12px | Compact spacing |
| `--cds-spacing-05` | 16px | Standard spacing |
| `--cds-spacing-06` | 24px | Large spacing |
| `--cds-spacing-07` | 32px | Extra large spacing |
| `--cds-spacing-08` | 40px | Section spacing |
| `--cds-spacing-09` | 48px | Page section spacing |

**Current Issues**: The Capabilities components use hardcoded rem values like:
- `1rem`, `0.75rem`, `0.5rem`, `0.25rem`, `2rem`, `1.5rem`
- These don't align to Carbon's 8px rhythm
- Makes spacing inconsistent across the application

## Components to Update

All components in `src/lib/components/Capabilities/`:
1. **DatasetInfo.svelte**
2. **EndpointCapabilities.svelte**
3. **ExtensionList.svelte**
4. **LanguageSupport.svelte**
5. **FeatureList.svelte**
6. **FormatList.svelte**

## Spacing Conversion Table

Map current hardcoded values to Carbon tokens:

| Current Value | Actual Pixels | Nearest Token | Token Value |
|---------------|---------------|---------------|-------------|
| `0.125rem` | 2px | `--cds-spacing-01` | 2px |
| `0.25rem` | 4px | `--cds-spacing-02` | 4px |
| `0.375rem` | 6px | `--cds-spacing-03` | 8px ⚠️ |
| `0.5rem` | 8px | `--cds-spacing-03` | 8px ✅ |
| `0.75rem` | 12px | `--cds-spacing-04` | 12px ✅ |
| `1rem` | 16px | `--cds-spacing-05` | 16px ✅ |
| `1.5rem` | 24px | `--cds-spacing-06` | 24px ✅ |
| `2rem` | 32px | `--cds-spacing-07` | 32px ✅ |
| `3rem` | 48px | `--cds-spacing-09` | 48px ✅ |

⚠️ **Note**: `0.375rem` (6px) rounds up to 8px to maintain 8px rhythm.

## Implementation Details

### 1. DatasetInfo.svelte

**Current issues**:
```css
padding: 0.75rem;        /* → --cds-spacing-04 (12px) */
padding: 0.5rem;         /* → --cds-spacing-03 (8px) */
gap: 1rem;               /* → --cds-spacing-05 (16px) */
gap: 0.75rem;            /* → --cds-spacing-04 (12px) */
gap: 0.5rem;             /* → --cds-spacing-03 (8px) */
margin: 1rem 0 0.5rem 0; /* → --cds-spacing-05 0 --cds-spacing-03 0 */
```

**Replace with**:
```css
padding: var(--cds-spacing-04);
padding: var(--cds-spacing-03);
gap: var(--cds-spacing-05);
gap: var(--cds-spacing-04);
gap: var(--cds-spacing-03);
margin: var(--cds-spacing-05) 0 var(--cds-spacing-03) 0;
```

### 2. EndpointCapabilities.svelte

**Current issues**:
```css
padding: 1rem;           /* → --cds-spacing-05 (16px) */
padding: 1rem 0;         /* → --cds-spacing-05 0 */
padding: 2rem 1rem;      /* → --cds-spacing-07 --cds-spacing-05 */
margin-bottom: 1.5rem;   /* → --cds-spacing-06 (24px) */
padding-bottom: 1rem;    /* → --cds-spacing-05 (16px) */
```

**Replace with**:
```css
padding: var(--cds-spacing-05);
padding: var(--cds-spacing-05) 0;
padding: var(--cds-spacing-07) var(--cds-spacing-05);
margin-bottom: var(--cds-spacing-06);
padding-bottom: var(--cds-spacing-05);
```

### 3. ExtensionList.svelte

**Current issues**:
```css
padding: 0;              /* Keep as-is */
padding: 0.75rem;        /* → --cds-spacing-04 (12px) */
```

**Replace with**:
```css
padding: 0;
padding: var(--cds-spacing-04);
```

### 4. LanguageSupport.svelte

**Current issues**:
```css
padding: 0;              /* Keep as-is */
padding: 0.25rem 0;      /* → --cds-spacing-02 0 */
gap: 0.5rem;             /* → --cds-spacing-03 (8px) */
```

**Replace with**:
```css
padding: 0;
padding: var(--cds-spacing-02) 0;
gap: var(--cds-spacing-03);
```

### 5. FeatureList.svelte

**Current issues**:
```css
gap: 0.5rem;             /* → --cds-spacing-03 (8px) */
```

**Replace with**:
```css
gap: var(--cds-spacing-03);
```

### 6. FormatList.svelte

**Current issues**:
```css
gap: 0.5rem;             /* → --cds-spacing-03 (8px) */
```

**Replace with**:
```css
gap: var(--cds-spacing-03);
```

## Implementation Plan

1. **For each component**:
   - Read the component file
   - Identify all hardcoded spacing values (padding, margin, gap)
   - Replace with appropriate Carbon spacing tokens
   - Use Edit tool to make replacements
   - Verify syntax is correct

2. **Update pattern**:
   ```typescript
   // Find all instances like:
   padding: 1rem;
   margin: 0.5rem;
   gap: 0.75rem;

   // Replace with:
   padding: var(--cds-spacing-05);
   margin: var(--cds-spacing-03);
   gap: var(--cds-spacing-04);
   ```

3. **Special cases**:
   - `padding: 0` or `margin: 0` → Keep as-is (no token needed)
   - Mixed values like `padding: 1rem 0.5rem` → `padding: var(--cds-spacing-05) var(--cds-spacing-03)`
   - Negative margins (rare) → Use `-var(--cds-spacing-XX)` if needed

4. **Testing after each component**:
   - Visual check in Storybook
   - Verify no layout breaks
   - Ensure consistent spacing

## Acceptance Criteria

- [ ] All 6 Capabilities components updated
- [ ] No hardcoded rem values for spacing (except 0)
- [ ] All spacing values use `var(--cds-spacing-XX)` tokens
- [ ] Components render correctly in Storybook
- [ ] No visual regressions (spacing may adjust slightly to 8px rhythm)
- [ ] Dark theme (g90, g100) still works correctly
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e:storybook`

## Testing Checklist

```bash
# 1. Visual verification in Storybook
npm run storybook
# Navigate to: Capabilities/EndpointCapabilities
# Check: spacing looks consistent, no overlaps

# 2. Build verification
npm run build
# Should complete with 0 errors, 0 warnings

# 3. Unit/Integration tests
npm test
# All tests should pass

# 4. E2E tests
npm run test:e2e:storybook
# Focus on: tests/e2e/endpoint-capabilities.storybook.spec.ts
```

## Expected Visual Changes

**Minor adjustments expected**:
- Some spacing may increase/decrease by 1-4px to align to 8px rhythm
- Overall appearance should remain very similar
- Spacing will feel more consistent and "snapped to grid"

**No changes to**:
- Component functionality
- Color schemes
- Typography (handled in Task 67)
- Layout structure (handled in Task 63)

## References

- Carbon Spacing Scale: https://carbondesignsystem.com/elements/spacing/overview/
- Carbon Design Tokens: https://carbondesignsystem.com/guidelines/color/usage/#tokens
- Task 63: Grid System (complementary)
- Task 67: Typography (follow-up)

## Notes

- This task can be done in parallel with Task 63 (Grid System)
- Focus on **spacing only** - don't change colors, fonts, or layout
- Use Edit tool for surgical replacements, not Write tool (preserve all other content)
- Document any edge cases or unusual spacing decisions in code comments
