# Task 81: Address UI/UX Agent Findings for Endpoint Dashboard

**Status:** PENDING
**Priority:** HIGH
**Estimated Effort:** 4-6 hours
**Dependencies:** Tasks 77-80 (completed)
**Agent Required:** ui-ux, component-dev, testing

## Overview

Address moderate accessibility issues and enhancement recommendations identified by the ui-ux agent review of the endpoint dashboard feature (Tasks 77-80).

**Current UI/UX Score:** 4.7/5 stars
**Goal:** 5.0/5 stars with full WCAG 2.1 AA compliance

## Agent Review Findings

### Moderate Issues (MUST FIX)

#### Issue 1: Missing Screen Reader Announcements
**Problem:** Dynamic content changes (capabilities loading, function search results, modal opening) are not announced to screen reader users.

**Impact:** Screen reader users cannot perceive when:
- Service description finishes loading
- Function search filters results
- Function details modal opens/closes
- Dashboard expands/collapses

**Solution Required:**
- Add ARIA live regions for dynamic content updates
- Announce loading state changes ("Loading capabilities...", "Capabilities loaded")
- Announce search result counts ("5 functions found")
- Announce modal state changes ("Function details opened", "Modal closed")

#### Issue 2: Missing Focus Management
**Problem:** When dashboard expands, keyboard focus remains on toggle button instead of moving to dashboard content.

**Impact:** Keyboard users must tab through all content to reach dashboard after expanding.

**Solution Required:**
- Move focus to first interactive element in dashboard when expanding
- Return focus to toggle button when collapsing
- Implement focus trap in function details modal
- Ensure Tab/Shift+Tab navigation is logical

### Enhancement Recommendations (NICE TO HAVE)

1. **Loading Skeletons:** Replace spinner with skeleton screens for better perceived performance
2. **Visual Indicators:** Add icons to indicate loading/error states in summary bar
3. **Category Filtering:** Add ability to filter extension functions by category/namespace
4. **Function Grouping:** Group functions by namespace in the function library
5. **Time Element:** Use `<time datetime="...">` for "Last Updated" display

## Requirements

### 1. Screen Reader Announcements

**Files to Modify:**
- `src/lib/components/Endpoint/EndpointInfoSummary.svelte`
- `src/lib/components/Endpoint/EndpointDashboard.svelte`
- `src/lib/components/Functions/FunctionLibrary.svelte`
- `src/lib/components/Functions/FunctionDetailsModal.svelte`

**Implementation:**

```svelte
<!-- EndpointInfoSummary.svelte -->
<div class="endpoint-info-summary">
  <!-- ARIA live region for status announcements -->
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {#if isExpanded}
      Dashboard expanded. {statusMessage}
    {:else}
      Dashboard collapsed
    {/if}
  </div>

  <Button on:click={handleToggle} aria-expanded={isExpanded}>
    {isExpanded ? 'Collapse' : 'Expand'} Dashboard
  </Button>
</div>

<!-- FunctionLibrary.svelte -->
<div class="function-library">
  <!-- Announce search results -->
  <div class="sr-only" role="status" aria-live="polite">
    {filteredFunctions.length} function{filteredFunctions.length !== 1 ? 's' : ''} found
  </div>

  <Search bind:value={searchTerm} placeholder="Search functions..." />
</div>
```

**CSS for sr-only:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 2. Focus Management

**Implementation:**

```svelte
<!-- EndpointInfoSummary.svelte -->
<script lang="ts">
  let dashboardRef = $state<HTMLElement>();
  let toggleButtonRef = $state<HTMLButtonElement>();

  function handleToggle() {
    isExpanded = !isExpanded;

    if (isExpanded) {
      // Focus first interactive element in dashboard
      tick().then(() => {
        const firstFocusable = dashboardRef?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });
    }
  }

  function handleCollapse() {
    isExpanded = false;
    // Return focus to toggle button
    tick().then(() => toggleButtonRef?.focus());
  }
</script>

<Button bind:this={toggleButtonRef} on:click={handleToggle}>
  Toggle Dashboard
</Button>

{#if isExpanded}
  <div bind:this={dashboardRef} class="dashboard">
    <EndpointDashboard onClose={handleCollapse} />
  </div>
{/if}
```

**Modal Focus Trap:**

```svelte
<!-- FunctionDetailsModal.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  let modalRef = $state<HTMLElement>();
  let previouslyFocused: HTMLElement | null = null;

  onMount(() => {
    // Store previously focused element
    previouslyFocused = document.activeElement as HTMLElement;

    // Focus first element in modal
    const firstFocusable = modalRef?.querySelector<HTMLElement>('button');
    firstFocusable?.focus();

    return () => {
      // Return focus when modal closes
      previouslyFocused?.focus();
    };
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }

    // Trap focus within modal
    if (event.key === 'Tab') {
      const focusableElements = modalRef?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
</script>

<Modal bind:open on:keydown={handleKeydown} bind:this={modalRef}>
  <!-- Modal content -->
</Modal>
```

### 3. Enhancement Implementations

#### Time Element (Quick Win)

```svelte
<!-- EndpointInfoSummary.svelte -->
{#if lastUpdated}
  <time datetime={lastUpdated.toISOString()} class="last-updated">
    Last updated: {formatTime(lastUpdated)}
  </time>
{/if}
```

#### Loading Skeletons (Optional)

```svelte
<!-- EndpointDashboard.svelte -->
{#if loading}
  <div class="skeleton-container">
    <SkeletonText heading lines={3} />
  </div>
{:else}
  <!-- Actual content -->
{/if}
```

## Acceptance Criteria

### Accessibility (MUST PASS)
- [ ] Screen reader announces dashboard state changes (expand/collapse)
- [ ] Screen reader announces loading states ("Loading...", "Loaded")
- [ ] Screen reader announces search result counts
- [ ] Screen reader announces modal open/close
- [ ] Focus moves to dashboard content when expanding
- [ ] Focus returns to toggle button when collapsing
- [ ] Focus trapped within modal (Tab/Shift+Tab cycles through modal elements)
- [ ] Escape key closes modal and returns focus
- [ ] All ARIA attributes validated with axe DevTools
- [ ] Manual screen reader testing (NVDA/JAWS on Windows, VoiceOver on Mac)

### E2E Tests (NEW)
- [ ] Test keyboard navigation: Tab, Shift+Tab, Enter, Escape
- [ ] Test focus management: expand → first element focused, collapse → toggle focused
- [ ] Test modal focus trap: Tab cycles within modal, Escape closes and returns focus
- [ ] Test ARIA live region updates (verify announcements in test output)

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] No build errors or warnings
- [ ] No ESLint violations
- [ ] Prettier formatting applied

## Testing Strategy

### 1. Manual Accessibility Testing

**Screen Reader Testing:**
- Windows: Test with NVDA (free) or JAWS
- macOS: Test with VoiceOver (built-in)
- Verify announcements for all state changes

**Keyboard Navigation Testing:**
- Tab through entire dashboard without mouse
- Verify focus indicators visible at all times
- Verify focus order is logical
- Test modal focus trap thoroughly

### 2. Automated Testing

**E2E Tests (Playwright):**
```typescript
// tests/e2e/endpoint-dashboard-a11y.storybook.spec.ts

test('should announce dashboard state changes to screen readers', async ({ page }) => {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint--default`);

  const liveRegion = page.getByRole('status');
  const toggleButton = page.getByRole('button', { name: /dashboard/i });

  // Expand dashboard
  await toggleButton.click();
  await expect(liveRegion).toContainText('Dashboard expanded');

  // Collapse dashboard
  await toggleButton.click();
  await expect(liveRegion).toContainText('Dashboard collapsed');
});

test('should manage focus when expanding/collapsing dashboard', async ({ page }) => {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint--default`);

  const toggleButton = page.getByRole('button', { name: /dashboard/i });

  // Expand and verify focus moves to dashboard
  await toggleButton.click();
  await page.waitForTimeout(500); // Wait for focus transition

  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);

  // Collapse and verify focus returns to toggle
  await page.keyboard.press('Escape');
  await expect(toggleButton).toBeFocused();
});

test('should trap focus within function details modal', async ({ page }) => {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-functions--default`);

  // Open modal
  await page.getByRole('button', { name: /details/i }).first().click();

  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();

  // Tab through modal elements
  const firstButton = modal.getByRole('button').first();
  const lastButton = modal.getByRole('button').last();

  await lastButton.focus();
  await page.keyboard.press('Tab');

  // Focus should wrap to first element
  await expect(firstButton).toBeFocused();

  // Shift+Tab from first should go to last
  await page.keyboard.press('Shift+Tab');
  await expect(lastButton).toBeFocused();

  // Escape closes modal
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
});
```

**axe DevTools Testing:**
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint--default`);
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

## Files to Modify

### Components (4 files)
- `src/lib/components/Endpoint/EndpointInfoSummary.svelte`
- `src/lib/components/Endpoint/EndpointDashboard.svelte`
- `src/lib/components/Functions/FunctionLibrary.svelte`
- `src/lib/components/Functions/FunctionDetailsModal.svelte`

### Tests (2 files)
- `tests/e2e/endpoint-dashboard-a11y.storybook.spec.ts` (NEW)
- `tests/e2e/function-library-a11y.storybook.spec.ts` (NEW)

### Styles (1 file)
- `src/lib/styles/accessibility.css` (NEW - for .sr-only utility)

## Build & Test Requirements

**Pre-commit checklist:**
```bash
npm run build           # MUST pass with 0 errors, 0 warnings
npm test                # MUST pass all tests
npm run test:e2e:storybook  # MUST pass all E2E tests (including new a11y tests)
```

**Expected Results:**
- Build: ✅ 0 errors, 0 warnings
- Unit/Integration Tests: ✅ All passing (1113+)
- E2E Tests: ✅ All passing (12 existing + 6 new a11y tests = 18 total)

## Success Criteria

- ✅ UI/UX agent review score: 5.0/5 stars
- ✅ All moderate accessibility issues resolved
- ✅ WCAG 2.1 AA compliance verified
- ✅ Manual screen reader testing passed
- ✅ All E2E tests passing
- ✅ Build with 0 errors and 0 warnings
- ✅ Code reviewed by ui-ux and testing agents

## References

- [ARIA Live Regions - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Focus Management - WebAIM](https://webaim.org/techniques/keyboard/tabindex)
- [Modal Dialog Example - W3C](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
