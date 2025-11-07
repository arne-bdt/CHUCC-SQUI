# Task 68: Verify Carbon Design System Compliance

**Status**: ✅ COMPLETED
**Priority**: High
**Estimated Effort**: 2-3 hours
**Dependencies**: Tasks 63, 64, 65, 66, 67 (all previous Carbon tasks must be complete)
**Related**: Carbon Design System Guide for AI Agents.pdf

## Objective

Comprehensively verify that all Carbon Design System improvements (Tasks 63-67) have been successfully implemented and that the application fully complies with Carbon design principles for grid, spacing, and typography.

## Background

This task serves as the final quality gate for the Carbon Design System implementation. It ensures:
- All previous tasks were completed correctly
- No regressions were introduced
- The application meets Carbon design standards
- All tests pass
- Documentation is updated

## Verification Scope

### 1. Grid System (Task 63)

**Check**:
- [ ] Main layout uses Carbon Grid classes or equivalent
- [ ] Content constrained to max-width: 99rem (1584px)
- [ ] Responsive columns: 16/8/4 at respective breakpoints
- [ ] Consistent side padding: 32px (large), 16px (medium/small)
- [ ] No horizontal scroll at any viewport width
- [ ] Vertical layout preserved (SplitPane still resizable)

**Test viewports**:
- 375px (mobile)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (desktop)
- 1920px (large desktop)

**Files to verify**:
- `src/SparqlQueryUI.svelte`

### 2. Spacing - Capabilities Components (Task 64)

**Check**:
- [ ] All spacing uses `var(--cds-spacing-XX)` tokens
- [ ] No hardcoded rem/px values for padding/margin/gap
- [ ] Spacing aligns to 8px rhythm
- [ ] Components render correctly

**Files to verify**:
- `src/lib/components/Capabilities/DatasetInfo.svelte`
- `src/lib/components/Capabilities/EndpointCapabilities.svelte`
- `src/lib/components/Capabilities/ExtensionList.svelte`
- `src/lib/components/Capabilities/LanguageSupport.svelte`
- `src/lib/components/Capabilities/FeatureList.svelte`
- `src/lib/components/Capabilities/FormatList.svelte`

### 3. Spacing - Functions Components (Task 65)

**Check**:
- [ ] FunctionLibrary uses spacing tokens
- [ ] FunctionDetails uses spacing tokens
- [ ] Function cards have consistent spacing
- [ ] Modal dialogs properly spaced

**Files to verify**:
- `src/lib/components/Functions/FunctionLibrary.svelte`
- `src/lib/components/Functions/FunctionDetails.svelte`

### 4. Spacing - Remaining Components (Task 66)

**Check**:
- [ ] Debug components use spacing tokens
- [ ] Query components use spacing tokens
- [ ] Tabs components use spacing tokens
- [ ] Layout components use spacing tokens
- [ ] Close button has adequate touch target

**Files to verify**:
- `src/lib/components/Debug/PerformancePanel.svelte`
- `src/lib/components/Query/QueryWarningDialog.svelte`
- `src/lib/components/Tabs/QueryTabs.svelte`
- `src/lib/components/Layout/SplitPane.svelte`

### 5. Typography (Task 67)

**Check**:
- [ ] All headings use Carbon heading tokens
- [ ] Body text uses Carbon body tokens
- [ ] Labels/helper text use Carbon label tokens
- [ ] Code uses Carbon code tokens
- [ ] Font weights match Carbon specs
- [ ] Line heights match Carbon specs
- [ ] Text hierarchy is clear

**Files to verify**:
- `src/lib/components/Results/ResultsPlaceholder.svelte`
- `src/lib/components/Functions/FunctionLibrary.svelte`
- `src/lib/components/Capabilities/EndpointCapabilities.svelte`
- `src/lib/components/Tabs/QueryTabs.svelte`
- `src/lib/components/Endpoint/EndpointSelector.svelte`
- All other components with custom typography

## Automated Testing

### 1. Build Verification

```bash
npm run build
```

**Expected outcome**:
- ✅ Build completes successfully
- ✅ 0 errors
- ✅ 0 warnings
- ✅ Bundle size reasonable (<5MB uncompressed)

**If build fails**:
- Check for syntax errors in CSS
- Verify all CSS variable references are correct
- Check for missing closing braces
- Review build logs for specific errors

### 2. Type Checking

```bash
npm run type-check
```

**Expected outcome**:
- ✅ 0 TypeScript errors
- ✅ All imports resolve correctly

### 3. Linting

```bash
npm run lint
```

**Expected outcome**:
- ✅ 0 linting errors
- ✅ 0 linting warnings
- ✅ Code style consistent

### 4. Unit & Integration Tests

```bash
npm test
```

**Expected outcome**:
- ✅ All tests pass
- ✅ No test failures
- ✅ Coverage maintained or improved

**Focus on**:
- Component rendering tests
- Store reactivity tests
- Integration tests for layout components

### 5. E2E Tests

```bash
npm run test:e2e:storybook
```

**Expected outcome**:
- ✅ All E2E tests pass
- ✅ No visual regressions
- ✅ User interactions work correctly

**If E2E tests fail**:
- Check if spacing changes broke selectors
- Verify component rendering in Storybook
- Review test expectations for hardcoded sizes

### 6. Storybook Build

```bash
npm run build-storybook
```

**Expected outcome**:
- ✅ Storybook builds successfully
- ✅ All stories render
- ✅ No console errors

## Manual Testing

### Visual Inspection Checklist

#### 1. Grid & Layout

**Test in Storybook**:
```
SparqlQueryUI → Default
SparqlQueryUI → With Tabs
SparqlQueryUI → Dark Theme
```

**Verify**:
- [ ] Content centered on large screens
- [ ] Max-width constraint applied
- [ ] Toolbar doesn't overflow
- [ ] Split pane resizes correctly
- [ ] Tabs render properly
- [ ] No horizontal scroll

**Test at viewports**: 375px, 768px, 1024px, 1440px, 1920px

#### 2. Spacing Consistency

**Test components**:
```
Capabilities → EndpointCapabilities
Functions → FunctionLibrary
Tabs → QueryTabs
Results → ResultsPlaceholder
```

**Verify**:
- [ ] Consistent gaps between elements
- [ ] Proper padding inside containers
- [ ] No cramped or overlapping content
- [ ] Spacing feels rhythmic and consistent
- [ ] Touch targets are adequate (min 44x44px)

**Use browser DevTools**:
- Inspect elements
- Check computed padding/margin values
- Verify they match spacing scale (8, 12, 16, 24, 32px)

#### 3. Typography

**Test components**:
```
All component stories
Focus on: headings, body text, labels
```

**Verify**:
- [ ] Heading hierarchy is clear (h1 > h2 > h3)
- [ ] Text is readable at all sizes
- [ ] Font sizes are consistent
- [ ] Line heights provide good readability
- [ ] Code text uses monospace font

**Check with browser zoom**:
- Zoom to 200% - text should remain readable
- Zoom to 50% - hierarchy should still be clear

#### 4. Dark Theme

**Test all stories with g90 theme**:
```
Change theme in Storybook toolbar
Test all components
```

**Verify**:
- [ ] Text contrast is adequate
- [ ] Spacing looks correct
- [ ] Colors use theme tokens
- [ ] No visual regressions

#### 5. Responsive Behavior

**Resize browser window**:
- Start at 1920px width
- Slowly resize down to 375px
- Watch for layout breaks

**Verify**:
- [ ] Toolbar wraps correctly at 768px
- [ ] Grid columns adjust at breakpoints
- [ ] No overflow or horizontal scroll
- [ ] Touch targets remain accessible

## Accessibility Verification

### 1. Contrast Check

Use browser DevTools or online tool:
- https://webaim.org/resources/contrastchecker/

**Requirements**:
- [ ] Body text: >= 4.5:1 contrast ratio
- [ ] Large text (>18px): >= 3:1 contrast ratio
- [ ] All text meets WCAG AA minimum

### 2. Keyboard Navigation

**Test**:
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] No keyboard traps

### 3. Screen Reader

Use NVDA (Windows) or VoiceOver (Mac):

**Test**:
- [ ] Headings are announced correctly
- [ ] Buttons have clear labels
- [ ] Form fields have labels
- [ ] Status messages are announced

## Documentation Updates

### 1. Update README.md (if needed)

Add section on Carbon Design System compliance:

```markdown
## Design System

SQUI follows the [IBM Carbon Design System](https://carbondesignsystem.com/) principles:

- **Grid**: 2x Grid system with 16/8/4 responsive columns
- **Spacing**: 8px base unit, using Carbon spacing tokens
- **Typography**: Carbon type scale for all text
- **Components**: Carbon Svelte components
- **Themes**: Support for g10, g90, g100 themes

For developers: Always use Carbon design tokens (`--cds-*`) for:
- Spacing (padding, margin, gap)
- Typography (font-size, line-height)
- Colors (text, background, borders)
```

### 2. Update CLAUDE.md (if needed)

Ensure project instructions reflect Carbon compliance:

```markdown
### Carbon Design System Compliance

- ✅ All components use Carbon Grid system
- ✅ All spacing uses `--cds-spacing-XX` tokens (8px rhythm)
- ✅ All typography uses `--cds-productive-heading-XX` or body/label tokens
- ✅ All colors use `--cds-text-*`, `--cds-layer-*`, `--cds-border-*` tokens
- ❌ Never use hardcoded pixel/rem values for spacing or font-size
- ❌ Never use arbitrary colors (use theme tokens)
```

### 3. Update Task Files

Mark completed tasks as ✅ COMPLETED:

- [ ] Task 63: Add Carbon Grid System
- [ ] Task 64: Standardize Spacing - Capabilities
- [ ] Task 65: Standardize Spacing - Functions
- [ ] Task 66: Standardize Spacing - Remaining
- [ ] Task 67: Apply Carbon Typography
- [ ] Task 68: Verify Carbon Compliance (this task)

## Acceptance Criteria

### Build & Tests
- [ ] `npm run build` - passes with 0 errors, 0 warnings
- [ ] `npm run type-check` - passes with 0 errors
- [ ] `npm run lint` - passes with 0 errors/warnings
- [ ] `npm test` - all tests pass
- [ ] `npm run test:e2e:storybook` - all E2E tests pass
- [ ] `npm run build-storybook` - builds successfully

### Visual Compliance
- [ ] Grid system implemented correctly
- [ ] All spacing uses Carbon tokens (8px rhythm)
- [ ] All typography uses Carbon type scale
- [ ] Responsive design works at all breakpoints
- [ ] No horizontal scroll
- [ ] No overlapping content
- [ ] Dark theme works correctly

### Accessibility
- [ ] All text meets WCAG AA contrast requirements
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Touch targets >= 44x44px

### Documentation
- [ ] README.md updated (if needed)
- [ ] CLAUDE.md updated with Carbon guidelines
- [ ] All task files marked as complete
- [ ] Code comments document Carbon usage

## Failure Handling

If verification fails:

### Build/Test Failures
1. Review error logs
2. Identify failed task (63-67)
3. Re-read task requirements
4. Fix issues
5. Re-run verification

### Visual Regressions
1. Screenshot before/after
2. Identify which task caused regression
3. Review component changes
4. Adjust spacing/typography as needed
5. Re-test

### Accessibility Issues
1. Use DevTools to identify problem elements
2. Check contrast ratios
3. Verify font sizes meet minimums
4. Add ARIA labels if needed
5. Re-test

## Completion Checklist

**Before marking task complete**:
- [ ] All automated tests pass
- [ ] Visual inspection complete
- [ ] Accessibility verified
- [ ] Documentation updated
- [ ] All previous tasks (63-67) marked complete
- [ ] No known issues or regressions
- [ ] Changes committed to git
- [ ] PR description includes screenshots/demo

**Final verification**:
```bash
# Run complete check
npm run check && npm run build && npm test && npm run test:e2e:storybook

# If all pass: ✅ Carbon Design System compliance achieved!
```

## References

- Carbon Design System Guide for AI Agents.pdf
- Task 63: Grid System
- Task 64: Spacing - Capabilities
- Task 65: Spacing - Functions
- Task 66: Spacing - Remaining
- Task 67: Typography
- Carbon Design System: https://carbondesignsystem.com/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

## Notes

- This is the final task in the Carbon compliance series
- Take time for thorough verification - quality matters
- Document any edge cases or exceptions
- If issues are found, fix them before marking complete
- Consider creating follow-up tasks for any improvements identified
- Celebrate successful completion - this is significant work! 🎉
