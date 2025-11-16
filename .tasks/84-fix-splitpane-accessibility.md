# Task 84: Fix SplitPane Accessibility Issues

**Status:** PENDING
**Priority:** CRITICAL
**Estimated Effort:** 3-4 hours
**Dependencies:** None
**Agent Required:** ui-ux

## Overview

Fix critical WCAG 2.1 Level AA accessibility violations in the SplitPane component identified in Task 83 comprehensive review:
1. Missing keyboard navigation for resizing (WCAG 2.1.1 - Keyboard)
2. Touch target size too small for mobile users (WCAG 2.5.5 - Target Size)

## Current Issues

### Issue 1: No Keyboard Resize Functionality
**File:** `src/lib/components/Layout/SplitPane.svelte`
**Severity:** CRITICAL - WCAG Level A violation
**Impact:** Keyboard-only users cannot resize panes

The divider has `tabindex="0"` and `role="separator"` but no keyboard event handlers:
```svelte
<div
  class="split-pane-divider"
  role="separator"
  aria-orientation="horizontal"
  tabindex="0"
  onmousedown={handleMouseDown}
  <!-- Missing: onkeydown handler -->
></div>
```

### Issue 2: Touch Target Too Small
**File:** `src/lib/components/Layout/SplitPane.svelte:145`
**Severity:** CRITICAL - WCAG Level AA violation
**Impact:** Touch device users cannot easily resize panes

Current divider height is only ~8px (`--cds-spacing-03`), well below the 44x44px minimum for touch targets.

## Implementation Steps

### Step 1: Add Keyboard Resize Support (2 hours)

1. Create keyboard event handler:
```typescript
function handleKeyboardResize(event: KeyboardEvent): void {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();

    const increment = 0.05; // 5% adjustment per keypress
    const newRatio = event.key === 'ArrowUp'
      ? Math.max(minTopHeight / containerHeight, splitRatio - increment)
      : Math.min(1 - minBottomHeight / containerHeight, splitRatio + increment);

    splitRatio = newRatio;

    // Announce change to screen readers
    const percentage = Math.round(newRatio * 100);
    // Update aria-valuenow
  }
}
```

2. Add keyboard event handler to divider:
```svelte
<div
  class="split-pane-divider"
  role="separator"
  aria-orientation="horizontal"
  aria-valuenow={Math.round(splitRatio * 100)}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Resize panes (use arrow keys)"
  tabindex="0"
  onmousedown={handleMouseDown}
  onkeydown={handleKeyboardResize}
></div>
```

3. Add visual feedback for keyboard focus:
```css
.split-pane-divider:focus-visible {
  outline: 2px solid var(--cds-focus);
  outline-offset: 2px;
}
```

### Step 2: Increase Touch Target Size (1 hour)

**Option A: Increase divider height**
```css
.split-pane-divider {
  height: 44px; /* Minimum touch target size */
  cursor: row-resize;
  background-color: var(--cds-border-subtle-01);
}
```

**Option B: Add invisible touch target overlay (recommended)**
```svelte
<div
  class="split-pane-divider-container"
  role="separator"
  aria-orientation="horizontal"
  aria-valuenow={Math.round(splitRatio * 100)}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Resize panes"
  tabindex="0"
  onmousedown={handleMouseDown}
  ontouchstart={handleTouchStart}
  onkeydown={handleKeyboardResize}
>
  <div class="split-pane-divider-visible"></div>
  <div class="split-pane-divider-touch-target"></div>
</div>
```

```css
.split-pane-divider-container {
  position: relative;
  height: 44px; /* Touch target height */
  display: flex;
  align-items: center;
  justify-content: center;
}

.split-pane-divider-visible {
  width: 100%;
  height: var(--cds-spacing-03); /* Visual divider (8px) */
  background-color: var(--cds-border-subtle-01);
  pointer-events: none; /* Let container handle events */
}

.split-pane-divider-touch-target {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 44px; /* Ensure 44px touch target */
  cursor: row-resize;
}
```

### Step 3: Add Touch Support (30 minutes)

```typescript
function handleTouchStart(event: TouchEvent): void {
  event.preventDefault();
  isDragging = true;

  const touch = event.touches[0];
  startY = touch.clientY;
  startRatio = splitRatio;

  // Add touch move and touch end listeners
  window.addEventListener('touchmove', handleTouchMove);
  window.addEventListener('touchend', handleTouchEnd);
}

function handleTouchMove(event: TouchEvent): void {
  if (!isDragging) return;

  const touch = event.touches[0];
  const deltaY = touch.clientY - startY;
  const containerHeight = containerRef?.clientHeight || 0;

  if (containerHeight > 0) {
    const deltaRatio = deltaY / containerHeight;
    splitRatio = Math.max(
      minTopHeight / containerHeight,
      Math.min(1 - minBottomHeight / containerHeight, startRatio + deltaRatio)
    );
  }
}

function handleTouchEnd(): void {
  isDragging = false;
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
}
```

### Step 4: Update Tests (30 minutes)

1. **Integration test** (`tests/integration/components/SplitPane.test.ts`):
```typescript
describe('SplitPane Accessibility', () => {
  it('should resize pane with arrow keys', async () => {
    const { container } = render(SplitPane, { /* props */ });

    const divider = container.querySelector('[role="separator"]');
    expect(divider).toBeInTheDocument();

    // Initial ratio
    const initialRatio = parseFloat(divider.getAttribute('aria-valuenow') || '50');

    // Press ArrowDown to increase ratio
    await fireEvent.keyDown(divider, { key: 'ArrowDown' });

    await waitFor(() => {
      const newRatio = parseFloat(divider.getAttribute('aria-valuenow') || '50');
      expect(newRatio).toBeGreaterThan(initialRatio);
    });
  });

  it('should have minimum 44px touch target', () => {
    const { container } = render(SplitPane, { /* props */ });

    const dividerContainer = container.querySelector('.split-pane-divider-container');
    const height = dividerContainer.clientHeight;

    expect(height).toBeGreaterThanOrEqual(44);
  });
});
```

2. **E2E test** (`tests/e2e/splitpane.storybook.spec.ts`):
```typescript
test('should resize with keyboard', async ({ page }) => {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-splitpane--default&viewMode=story`);

  const divider = page.getByRole('separator', { name: /resize panes/i });
  await divider.focus();

  // Get initial split ratio
  const initialValue = await divider.getAttribute('aria-valuenow');

  // Press ArrowDown
  await divider.press('ArrowDown');

  // Verify ratio changed
  const newValue = await divider.getAttribute('aria-valuenow');
  expect(parseFloat(newValue)).toBeGreaterThan(parseFloat(initialValue));
});
```

## Acceptance Criteria

- ✅ Divider is keyboard accessible (ArrowUp/ArrowDown resize panes)
- ✅ Divider has minimum 44x44px touch target
- ✅ Touch events (touchstart, touchmove, touchend) properly handled
- ✅ ARIA attributes updated correctly (aria-valuenow reflects current ratio)
- ✅ Visual focus indicator visible on keyboard focus
- ✅ Integration tests verify keyboard and touch functionality
- ✅ E2E tests verify accessibility in real browser
- ✅ WCAG 2.1 Level AA compliant (keyboard + touch)
- ✅ Announcement to screen readers when ratio changes
- ✅ Build passes: `npm run build`
- ✅ All tests pass: `npm test && npm run test:e2e:storybook`

## Testing Strategy

1. **Manual Testing:**
   - Tab to divider, verify focus indicator visible
   - Press ArrowUp/ArrowDown, verify panes resize smoothly
   - Use screen reader (NVDA/JAWS/VoiceOver) to verify announcements
   - Test on touch device (or Chrome DevTools device emulation)
   - Verify touch target size is sufficient

2. **Automated Testing:**
   - Integration tests for keyboard events
   - E2E tests for visual verification in Storybook
   - Accessibility audits using Playwright axe integration

3. **Cross-Browser Testing:**
   - Chrome, Firefox, Safari, Edge
   - Mobile Safari, Chrome Mobile

## Success Criteria

- ✅ WCAG 2.1 Level A compliant (keyboard)
- ✅ WCAG 2.1 Level AA compliant (touch target size)
- ✅ No accessibility violations in automated tests
- ✅ Smooth keyboard and touch resizing experience
- ✅ Proper screen reader announcements
- ✅ All tests passing

## References

- [WCAG 2.1.1 - Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [WCAG 2.5.5 - Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Carbon Design System - Accessibility](https://carbondesignsystem.com/guidelines/accessibility/overview)
- [Task 83 - Comprehensive Review](./83-comprehensive-project-review.md)
