# Task 82: Complete Test Coverage for Endpoint Dashboard

**Status:** PENDING
**Priority:** HIGH
**Estimated Effort:** 8-12 hours
**Dependencies:** Tasks 77-80 (completed)
**Agent Required:** testing, component-dev

## Overview

Achieve >80% test coverage for endpoint dashboard feature (Tasks 77-80) by adding comprehensive unit, integration, and E2E tests.

**Current Coverage:** ~15% (11/70-80 tests)
**Target Coverage:** >80% (70-80 total tests)
**Gap:** 59-69 tests needed

## Testing Agent Review Findings

### Critical Gaps Identified

#### 1. NO Unit/Integration Tests for Components
**Problem:** Zero test files exist for EndpointInfoSummary and EndpointDashboard components.

**Missing Tests:**
- EndpointInfoSummary: 15-20 tests needed
- EndpointDashboard: 20-25 tests needed
- CapabilitiesPanel: 5-8 tests needed
- DatasetsPanel: 5-8 tests needed
- FunctionLibrary: 8-10 tests needed
- FunctionDetailsModal: 5-8 tests needed

**Impact:** Cannot verify component rendering, state management, or reactivity in isolation.

#### 2. Missing E2E Interaction Tests
**Problem:** E2E tests only verify rendering, not user interactions.

**Missing Scenarios:**
- Expand/collapse dashboard (click, keyboard)
- Refresh service description (button click, error handling)
- Search functions (typing, filtering, clearing)
- Open function details modal (click, keyboard, close)
- Navigate between tabs (click, keyboard arrows)
- Insert function into editor (button click, callback verification)

#### 3. Missing Error Handling Tests
**Problem:** No tests for error states, edge cases, or failure scenarios.

**Missing Scenarios:**
- Network failure during service description fetch
- Invalid service description data
- Empty results (no capabilities, no datasets, no functions)
- Unbound variables in dataset graphs
- Function search with no matches
- Modal open/close edge cases

#### 4. Missing Accessibility Tests
**Problem:** No automated accessibility verification (keyboard nav, ARIA, screen readers).

**Missing Tests:**
- Keyboard navigation (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- ARIA attributes (aria-expanded, aria-label, role, aria-live)
- Focus management (expand/collapse, modal open/close)
- Screen reader announcements (ARIA live regions)

## Requirements

### 1. Unit/Integration Tests

#### EndpointInfoSummary Tests (15-20 tests)

**File:** `tests/integration/EndpointInfoSummary.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EndpointInfoSummary from '$lib/components/Endpoint/EndpointInfoSummary.svelte';
import { getServiceDescriptionStore } from '$lib/services/serviceDescriptionService';
import { getEndpointStore } from '$lib/stores/endpointStore';

describe('EndpointInfoSummary', () => {
  let endpointStore: ReturnType<typeof getEndpointStore>;
  let serviceDescStore: ReturnType<typeof getServiceDescriptionStore>;

  beforeEach(() => {
    endpointStore = getEndpointStore();
    serviceDescStore = getServiceDescriptionStore();
  });

  // Rendering Tests
  it('should render collapsed by default', () => {
    render(EndpointInfoSummary);
    expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
  });

  it('should display endpoint URL in summary', async () => {
    endpointStore.setUrl('https://example.com/sparql');
    render(EndpointInfoSummary);
    await waitFor(() => {
      expect(screen.getByText(/example\.com/)).toBeInTheDocument();
    });
  });

  // Expand/Collapse Tests
  it('should expand dashboard when toggle button clicked', async () => {
    const user = userEvent.setup();
    render(EndpointInfoSummary);

    const toggleButton = screen.getByRole('button', { name: /expand/i });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
    });
  });

  it('should collapse dashboard when toggle button clicked again', async () => {
    const user = userEvent.setup();
    render(EndpointInfoSummary);

    const expandButton = screen.getByRole('button', { name: /expand/i });
    await user.click(expandButton);

    const collapseButton = await screen.findByRole('button', { name: /collapse/i });
    await user.click(collapseButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });
  });

  // Auto-fetch Tests
  it('should fetch service description when endpoint changes', async () => {
    const fetchSpy = vi.spyOn(serviceDescStore, 'fetchServiceDescription');

    render(EndpointInfoSummary);
    endpointStore.setUrl('https://example.com/sparql');

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('https://example.com/sparql');
    });
  });

  it('should not fetch if endpoint is empty', async () => {
    const fetchSpy = vi.spyOn(serviceDescStore, 'fetchServiceDescription');

    render(EndpointInfoSummary);
    endpointStore.setUrl('');

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  // Loading State Tests
  it('should show loading spinner when fetching', async () => {
    render(EndpointInfoSummary);
    serviceDescStore.setLoading(true);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('should hide loading spinner when fetch completes', async () => {
    render(EndpointInfoSummary);
    serviceDescStore.setLoading(true);

    await waitFor(() => screen.getByRole('status'));

    serviceDescStore.setLoading(false);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // Capabilities Display Tests
  it('should display capability counts in summary', async () => {
    serviceDescStore.setCapabilities(['SPARQL 1.1 Query', 'SPARQL 1.1 Update']);
    render(EndpointInfoSummary);

    await waitFor(() => {
      expect(screen.getByText(/2 capabilities/i)).toBeInTheDocument();
    });
  });

  it('should display dataset count in summary', async () => {
    serviceDescStore.setDatasets([
      { uri: 'http://example.com/graph1', name: 'Graph 1' },
      { uri: 'http://example.com/graph2', name: 'Graph 2' },
    ]);
    render(EndpointInfoSummary);

    await waitFor(() => {
      expect(screen.getByText(/2 datasets/i)).toBeInTheDocument();
    });
  });

  it('should display function count in summary', async () => {
    serviceDescStore.setFunctions([
      { uri: 'http://example.com/fn1', name: 'fn:function1', description: 'Test' },
      { uri: 'http://example.com/fn2', name: 'fn:function2', description: 'Test' },
      { uri: 'http://example.com/fn3', name: 'fn:function3', description: 'Test' },
    ]);
    render(EndpointInfoSummary);

    await waitFor(() => {
      expect(screen.getByText(/3 functions/i)).toBeInTheDocument();
    });
  });

  // Error Handling Tests
  it('should display error message when fetch fails', async () => {
    render(EndpointInfoSummary);
    serviceDescStore.setError('Network error');

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should allow retry after error', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(serviceDescStore, 'fetchServiceDescription');

    render(EndpointInfoSummary);
    serviceDescStore.setError('Network error');

    const retryButton = await screen.findByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(fetchSpy).toHaveBeenCalled();
  });

  // Edge Cases
  it('should handle empty service description gracefully', async () => {
    serviceDescStore.setCapabilities([]);
    serviceDescStore.setDatasets([]);
    serviceDescStore.setFunctions([]);

    render(EndpointInfoSummary);

    await waitFor(() => {
      expect(screen.getByText(/0 capabilities/i)).toBeInTheDocument();
      expect(screen.getByText(/0 datasets/i)).toBeInTheDocument();
      expect(screen.getByText(/0 functions/i)).toBeInTheDocument();
    });
  });

  it('should update summary when service description changes', async () => {
    render(EndpointInfoSummary);

    serviceDescStore.setCapabilities(['Cap 1']);
    await waitFor(() => screen.getByText(/1 capability/i));

    serviceDescStore.setCapabilities(['Cap 1', 'Cap 2', 'Cap 3']);
    await waitFor(() => {
      expect(screen.getByText(/3 capabilities/i)).toBeInTheDocument();
    });
  });

  // Keyboard Navigation Tests
  it('should toggle on Enter key', async () => {
    const user = userEvent.setup();
    render(EndpointInfoSummary);

    const toggleButton = screen.getByRole('button', { name: /expand/i });
    toggleButton.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
    });
  });

  it('should toggle on Space key', async () => {
    const user = userEvent.setup();
    render(EndpointInfoSummary);

    const toggleButton = screen.getByRole('button', { name: /expand/i });
    toggleButton.focus();
    await user.keyboard(' ');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
    });
  });

  // ARIA Tests
  it('should have correct ARIA attributes', () => {
    render(EndpointInfoSummary);

    const toggleButton = screen.getByRole('button', { name: /expand/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should update aria-expanded when toggled', async () => {
    const user = userEvent.setup();
    render(EndpointInfoSummary);

    const toggleButton = screen.getByRole('button', { name: /expand/i });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
```

#### EndpointDashboard Tests (20-25 tests)

**File:** `tests/integration/EndpointDashboard.test.ts`

**Test Categories:**
- Rendering (tab structure, initial tab selection)
- Tab Navigation (click, keyboard arrows, Enter/Space)
- Capabilities Panel (display, empty state)
- Datasets Panel (display, empty state, unbound variables)
- Functions Panel (search, filtering, insertion callback)
- Store Reactivity (updates when store changes)
- Edge Cases (no data, invalid data, loading states)
- Accessibility (ARIA, keyboard navigation)

#### FunctionLibrary Tests (8-10 tests)

**File:** `tests/integration/FunctionLibrary.test.ts`

**Test Categories:**
- Search (typing, filtering, clearing, no matches)
- Function Display (list rendering, grouping, sorting)
- Details Modal (open, close, keyboard, content)
- Insertion (button click, callback invocation)
- Edge Cases (empty list, special characters in search)

### 2. E2E Interaction Tests

**File:** `tests/e2e/endpoint-dashboard-interactions.storybook.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Endpoint Dashboard Interactions', () => {
  test('should expand and collapse dashboard on click', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint--default`);
    await page.waitForTimeout(1500);

    const toggleButton = page.getByRole('button', { name: /dashboard/i });

    // Expand
    await toggleButton.click();
    await expect(page.getByRole('tab', { name: /capabilities/i })).toBeVisible();

    // Collapse
    await toggleButton.click();
    await expect(page.getByRole('tab', { name: /capabilities/i })).not.toBeVisible();
  });

  test('should navigate tabs with keyboard', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint--default`);
    await page.waitForTimeout(1500);

    // Open dashboard
    await page.getByRole('button', { name: /expand/i }).click();

    const capabilitiesTab = page.getByRole('tab', { name: /capabilities/i });
    const datasetsTab = page.getByRole('tab', { name: /datasets/i });
    const functionsTab = page.getByRole('tab', { name: /functions/i });

    // Focus capabilities tab
    await capabilitiesTab.focus();

    // Arrow right to datasets
    await page.keyboard.press('ArrowRight');
    await expect(datasetsTab).toBeFocused();

    // Arrow right to functions
    await page.keyboard.press('ArrowRight');
    await expect(functionsTab).toBeFocused();

    // Arrow left back to datasets
    await page.keyboard.press('ArrowLeft');
    await expect(datasetsTab).toBeFocused();
  });

  test('should search and filter functions', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-functions--default`);
    await page.waitForTimeout(1500);

    const searchInput = page.getByPlaceholder('Search functions...');

    // Initial count
    const initialCount = await page.getByRole('button', { name: /details/i }).count();
    expect(initialCount).toBeGreaterThan(0);

    // Search
    await searchInput.fill('concat');
    await page.waitForTimeout(500);

    // Filtered count should be less
    const filteredCount = await page.getByRole('button', { name: /details/i }).count();
    expect(filteredCount).toBeLessThan(initialCount);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Count should return to initial
    const clearedCount = await page.getByRole('button', { name: /details/i }).count();
    expect(clearedCount).toBe(initialCount);
  });

  test('should open and close function details modal', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-functions--default`);
    await page.waitForTimeout(1500);

    const detailsButton = page.getByRole('button', { name: /details/i }).first();
    await detailsButton.click();

    // Modal should be visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Close with button
    await page.getByRole('button', { name: /close/i }).click();
    await expect(modal).not.toBeVisible();

    // Open again
    await detailsButton.click();
    await expect(modal).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should insert function into editor on button click', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-functions--with-insertion`);
    await page.waitForTimeout(1500);

    const insertButton = page.getByRole('button', { name: /insert/i }).first();
    await insertButton.click();

    // Verify callback was invoked (check for success message or editor update)
    await expect(page.getByText(/inserted/i)).toBeVisible({ timeout: 2000 });
  });

  test('should refresh service description on button click', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint--default`);
    await page.waitForTimeout(1500);

    // Expand dashboard
    await page.getByRole('button', { name: /expand/i }).click();

    const refreshButton = page.getByRole('button', { name: /refresh/i });
    await refreshButton.click();

    // Should show loading state
    await expect(page.getByRole('status')).toBeVisible({ timeout: 1000 });

    // Wait for loading to complete
    await expect(page.getByRole('status')).not.toBeVisible({ timeout: 5000 });
  });
});
```

### 3. E2E Error Handling Tests

**File:** `tests/e2e/endpoint-dashboard-errors.storybook.spec.ts`

**Test Scenarios:**
- Network failure during fetch (mock network error)
- Invalid service description data (malformed response)
- Empty results (no capabilities/datasets/functions)
- Retry after error (click retry button)
- Timeout during fetch (slow network simulation)

### 4. E2E Accessibility Tests

**File:** `tests/e2e/endpoint-dashboard-a11y.storybook.spec.ts`

**Test Scenarios:**
- Keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
- ARIA attributes verification (aria-expanded, role, aria-label)
- Focus indicators visible at all times
- Screen reader announcements (ARIA live regions)
- Focus management (expand/collapse, modal open/close)

## Test Coverage Breakdown

### Unit/Integration Tests (48-58 tests)
- EndpointInfoSummary: 15-20 tests
- EndpointDashboard: 20-25 tests
- FunctionLibrary: 8-10 tests
- CapabilitiesPanel: 5-8 tests (if separate file)

### E2E Tests (22-28 tests)
- Existing rendering tests: 12 tests
- Interaction tests: 6-8 tests (new)
- Error handling tests: 4-6 tests (new)
- Accessibility tests: 5-8 tests (moved from Task 81)

### Total: 70-86 tests

## Acceptance Criteria

### Code Coverage
- [ ] >80% line coverage for endpoint dashboard components
- [ ] >80% branch coverage for all conditional logic
- [ ] 100% coverage for critical paths (expand/collapse, fetch, search)

### Test Quality
- [ ] All tests pass consistently (no flaky tests)
- [ ] Tests are fast (<5s for all unit/integration tests)
- [ ] Tests use semantic queries (getByRole, getByText, getByPlaceholder)
- [ ] Tests verify actual user behavior, not implementation details
- [ ] Tests include helpful error messages and debugging info

### Build & Tests Status
- [ ] `npm run build` - 0 errors, 0 warnings
- [ ] `npm test` - All tests passing (1113+ existing + 70-80 new = 1183-1193 total)
- [ ] `npm run test:e2e:storybook` - All E2E tests passing (18+ existing + 10-14 new = 28-32 total)

## Files to Create/Modify

### New Test Files (6 files)
- `tests/integration/EndpointInfoSummary.test.ts` (NEW)
- `tests/integration/EndpointDashboard.test.ts` (NEW)
- `tests/integration/FunctionLibrary.test.ts` (NEW)
- `tests/e2e/endpoint-dashboard-interactions.storybook.spec.ts` (NEW)
- `tests/e2e/endpoint-dashboard-errors.storybook.spec.ts` (NEW)
- `tests/e2e/endpoint-dashboard-a11y.storybook.spec.ts` (MOVED from Task 81)

### Existing Files to Modify
- Update Storybook stories with play functions for interaction testing
- Add error state stories for error handling tests

## Success Criteria

- ✅ Test coverage >80% for endpoint dashboard feature
- ✅ All 70-80 new tests passing
- ✅ No flaky tests (run 10 times, all pass)
- ✅ Testing agent review score: 5.0/5 stars
- ✅ Build with 0 errors and 0 warnings
- ✅ All E2E tests passing (28-32 total)
- ✅ Code reviewed by testing and component-dev agents

## Implementation Strategy

### Phase 1: Unit/Integration Tests (6-8 hours)
1. Create EndpointInfoSummary.test.ts (2-3 hours)
2. Create EndpointDashboard.test.ts (3-4 hours)
3. Create FunctionLibrary.test.ts (1-2 hours)

### Phase 2: E2E Interaction Tests (2-3 hours)
1. Create endpoint-dashboard-interactions.storybook.spec.ts (1-2 hours)
2. Create endpoint-dashboard-errors.storybook.spec.ts (1 hour)

### Phase 3: Verification (1 hour)
1. Run all tests and verify coverage
2. Fix any failures or flaky tests
3. Review with testing agent

## References

- [Testing Library Best Practices](https://testing-library.com/docs/queries/about#priority)
- [Vitest API Reference](https://vitest.dev/api/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Svelte Components](https://testing-library.com/docs/svelte-testing-library/intro)
