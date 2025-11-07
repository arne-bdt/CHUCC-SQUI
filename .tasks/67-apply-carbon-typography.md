# Task 67: Apply Carbon Typography Scale

**Status**: ✅ Completed
**Priority**: Medium
**Estimated Effort**: 3-4 hours
**Dependencies**: Tasks 64, 65, 66 (spacing should be complete first)
**Related**: Carbon Design System Guide for AI Agents.pdf
**Completed**: 2025-11-07

## Objective

Standardize all typography (font sizes, weights, line heights) to use Carbon Design System's type scale, ensuring consistent and accessible text throughout the application.

## Background

Carbon Design System provides a comprehensive type scale with tokens for different text purposes (headings, body text, labels, code, etc.). The type scale is designed to work with the 8px grid and spacing system, maintaining proper vertical rhythm and visual hierarchy.

Currently, the application uses a mix of hardcoded font-size values (rem, px) that don't align with Carbon's scale, leading to:
- Inconsistent text sizing
- Non-standard heading hierarchy
- Potential accessibility issues

**Carbon Type Tokens** (Productive Style):

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--cds-productive-heading-07` | 3.375rem (54px) | 300 | 1.19 | Hero heading |
| `--cds-productive-heading-06` | 2.625rem (42px) | 300 | 1.19 | Page title |
| `--cds-productive-heading-05` | 2rem (32px) | 400 | 1.25 | Section heading |
| `--cds-productive-heading-04` | 1.75rem (28px) | 400 | 1.29 | Sub-section heading |
| `--cds-productive-heading-03` | 1.25rem (20px) | 400 | 1.4 | Component heading |
| `--cds-productive-heading-02` | 1rem (16px) | 600 | 1.5 | Small heading |
| `--cds-productive-heading-01` | 0.875rem (14px) | 600 | 1.43 | Tiny heading |
| `--cds-body-02` | 1rem (16px) | 400 | 1.5 | Body text |
| `--cds-body-01` | 0.875rem (14px) | 400 | 1.43 | Small body text |
| `--cds-body-compact-02` | 1rem (16px) | 400 | 1.375 | Compact body |
| `--cds-body-compact-01` | 0.875rem (14px) | 400 | 1.29 | Compact small |
| `--cds-label-02` | 0.875rem (14px) | 400 | 1.29 | Label |
| `--cds-label-01` | 0.75rem (12px) | 400 | 1.34 | Small label |
| `--cds-helper-text-02` | 0.875rem (14px) | 400 | 1.43 | Helper text |
| `--cds-helper-text-01` | 0.75rem (12px) | 400 | 1.34 | Small helper |
| `--cds-code-02` | 0.875rem (14px) | 400 | 1.43 | Code |
| `--cds-code-01` | 0.75rem (12px) | 400 | 1.34 | Small code |

**Note**: Carbon also has "Expressive" type tokens for marketing/editorial content. Use "Productive" for application UI.

## Current Typography Issues

### Common hardcoded values found:

```css
font-size: 1.25rem;      /* → --cds-productive-heading-03 */
font-size: 1.125rem;     /* → --cds-productive-heading-02 or heading-03 */
font-size: 1rem;         /* → --cds-body-02 or heading-02 */
font-size: 0.875rem;     /* → --cds-body-01 or label-02 */
font-size: 0.8125rem;    /* → --cds-label-01 (0.75rem) */
font-size: 0.75rem;      /* → --cds-label-01 or helper-text-01 */
font-size: 3rem;         /* → --cds-productive-heading-05 (2rem) */
```

### Components with typography issues:

1. **ResultsPlaceholder.svelte**:
   - `.placeholder-content h3`: `font-size: 1.25rem`
   - `.placeholder-content p`: `font-size: 0.875rem`
   - `.ask-result`: `font-size: 3rem` (too large)
   - `.execution-time`: `font-size: 0.75rem`

2. **FunctionLibrary.svelte**:
   - `.header h3`: `font-size: 1rem`
   - `.function-uri`: `font-size: 0.875rem`
   - `.function-label`: `font-size: 0.875rem`
   - `.function-description`: `font-size: 0.875rem`
   - `.empty-state p`: `font-size: 0.875rem`

3. **EndpointCapabilities.svelte**:
   - `.panel-title`: `font-size: 1.125rem`
   - `.section-title`: `font-size: 0.875rem`
   - `.metadata`: `font-size: 0.75rem`
   - `.empty-hint`: `font-size: 0.8125rem`

4. **QueryTabs.svelte**:
   - `.tab-name`: `font-size: 0.875rem`

5. **EndpointSelector.svelte**:
   - Description text: `font-size: 0.75rem`

6. **Other components** (audit during implementation)

## Implementation Strategy

### 1. Typography Mapping

Create a mapping of current values to Carbon tokens:

```css
/* Headings */
h1, .large-heading {
  font-size: var(--cds-productive-heading-05); /* 32px */
  font-weight: 400;
  line-height: 1.25;
}

h2, .section-heading {
  font-size: var(--cds-productive-heading-04); /* 28px */
  font-weight: 400;
  line-height: 1.29;
}

h3, .subsection-heading {
  font-size: var(--cds-productive-heading-03); /* 20px */
  font-weight: 400;
  line-height: 1.4;
}

h4, .component-heading {
  font-size: var(--cds-productive-heading-02); /* 16px */
  font-weight: 600;
  line-height: 1.5;
}

h5, .small-heading {
  font-size: var(--cds-productive-heading-01); /* 14px */
  font-weight: 600;
  line-height: 1.43;
}

/* Body text */
p, .body-text {
  font-size: var(--cds-body-02); /* 16px */
  font-weight: 400;
  line-height: 1.5;
}

.body-text-small {
  font-size: var(--cds-body-01); /* 14px */
  font-weight: 400;
  line-height: 1.43;
}

/* Labels and helper text */
.label {
  font-size: var(--cds-label-02); /* 14px */
  line-height: 1.29;
}

.label-small, .helper-text {
  font-size: var(--cds-label-01); /* 12px */
  line-height: 1.34;
}

/* Code */
code, .code-text {
  font-family: var(--cds-code-font-family, 'IBM Plex Mono', monospace);
  font-size: var(--cds-code-02); /* 14px */
  line-height: 1.43;
}
```

### 2. CSS Custom Properties Approach

Instead of using full token names (verbose), consider creating semantic variables:

```css
:root {
  /* Typography scale */
  --font-size-h1: var(--cds-productive-heading-05);
  --font-size-h2: var(--cds-productive-heading-04);
  --font-size-h3: var(--cds-productive-heading-03);
  --font-size-h4: var(--cds-productive-heading-02);
  --font-size-h5: var(--cds-productive-heading-01);
  --font-size-body: var(--cds-body-02);
  --font-size-body-small: var(--cds-body-01);
  --font-size-label: var(--cds-label-02);
  --font-size-label-small: var(--cds-label-01);
  --font-size-code: var(--cds-code-02);
}
```

**Pros**: More readable, easier to refactor
**Cons**: Extra abstraction layer

**Recommendation**: Use Carbon tokens directly for transparency.

### 3. Component-by-Component Updates

For each component:

```css
/* Before */
.component-title {
  font-size: 1.125rem;
  font-weight: 600;
}

/* After */
.component-title {
  font-size: var(--cds-productive-heading-03);
  font-weight: 400; /* Carbon default for heading-03 */
  line-height: 1.4;
}
```

**Important**: Also update font-weight and line-height to match Carbon's specifications.

## Component-Specific Changes

### ResultsPlaceholder.svelte

```css
/* Before */
.placeholder-content h3 {
  font-size: 1.25rem; /* 20px */
  font-weight: 400;
}

.placeholder-content p {
  font-size: 0.875rem; /* 14px */
}

.ask-result {
  font-size: 3rem; /* 48px - too large! */
  font-weight: 600;
}

.execution-time {
  font-size: 0.75rem; /* 12px */
}

/* After */
.placeholder-content h3 {
  font-size: var(--cds-productive-heading-03); /* 20px - same */
  font-weight: 400;
  line-height: 1.4;
}

.placeholder-content p {
  font-size: var(--cds-body-01); /* 14px - same */
  line-height: 1.43;
}

.ask-result {
  font-size: var(--cds-productive-heading-05); /* 32px - reduced */
  font-weight: 600;
  line-height: 1.25;
}

.execution-time {
  font-size: var(--cds-label-01); /* 12px - same */
  line-height: 1.34;
}
```

**Note**: ASK result reduced from 48px to 32px for consistency. Still large and prominent.

### FunctionLibrary.svelte

```css
/* Before */
.header h3 {
  font-size: 1rem;
  font-weight: 600;
}

/* After */
.header h3 {
  font-size: var(--cds-productive-heading-02);
  font-weight: 600;
  line-height: 1.5;
}
```

### EndpointCapabilities.svelte

```css
/* Before */
.panel-title {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
}

/* After */
.panel-title {
  font-size: var(--cds-productive-heading-03); /* 20px - slightly larger */
  font-weight: 400;
  line-height: 1.4;
}
```

## Implementation Plan

1. **Audit all components**:
   - Use grep to find all `font-size:` declarations
   - Create comprehensive list with current values
   - Map to appropriate Carbon tokens

2. **Create global typography baseline** (optional):
   - Add base typography rules to `app.css` or `global.css`
   - Define default heading styles
   - Set body font defaults

3. **Update components systematically**:
   - Start with most visible: ResultsPlaceholder, QueryTabs
   - Then Capabilities and Functions
   - Finally edge cases and debug components

4. **Test after each component**:
   - Visual check in Storybook
   - Verify text hierarchy
   - Check readability
   - Test dark theme

5. **Verify accessibility**:
   - Check contrast ratios (WCAG AA)
   - Test with browser zoom (200%)
   - Verify screen reader compatibility

## Acceptance Criteria

- [ ] All heading elements use Carbon heading tokens
- [ ] All body text uses Carbon body tokens
- [ ] All labels/helper text use Carbon label tokens
- [ ] Code elements use Carbon code tokens
- [ ] Font weights match Carbon specifications
- [ ] Line heights match Carbon specifications
- [ ] Text hierarchy is clear and consistent
- [ ] All text meets WCAG AA contrast requirements
- [ ] Components render correctly in Storybook
- [ ] Dark theme typography works correctly
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e:storybook`

## Testing Checklist

```bash
# 1. Visual typography check
npm run storybook
# Navigate through all component stories
# Check:
#   - Heading sizes are appropriate
#   - Text is readable
#   - Hierarchy is clear
#   - No overlapping or cramped text

# 2. Accessibility check
# Use browser DevTools
# Check:
#   - Contrast ratios >= 4.5:1 for body text
#   - Contrast ratios >= 3:1 for large text
#   - Text zoom to 200% works

# 3. Build verification
npm run build
# Should complete with 0 errors, 0 warnings

# 4. Unit/Integration tests
npm test
# All tests should pass

# 5. E2E tests
npm run test:e2e:storybook
# All tests should pass
```

## Expected Visual Changes

**Text size adjustments**:
- ASK result: Reduced from 48px to 32px (still prominent)
- Some headings: May increase/decrease 1-4px to align with scale
- Overall: More consistent text hierarchy

**Improved**:
- Text readability
- Visual hierarchy
- Consistent spacing (with Tasks 64-66)
- Professional appearance

**No changes to**:
- Component functionality
- Colors (handled by existing theme)
- Layout (handled by Task 63)
- Spacing (handled by Tasks 64-66)

## References

- Carbon Typography: https://carbondesignsystem.com/elements/typography/overview/
- Carbon Type Tokens: https://carbondesignsystem.com/elements/typography/type-tokens/
- WCAG Contrast Requirements: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- IBM Plex Fonts: https://github.com/IBM/plex

## Notes

- This task should be done AFTER spacing tasks (64-66) to avoid layout conflicts
- Use Carbon's default font-weights for each token (don't override unless necessary)
- Always set line-height with font-size for proper vertical rhythm
- Test with actual content, not just placeholder text
- Document any deviations from Carbon scale with justification
