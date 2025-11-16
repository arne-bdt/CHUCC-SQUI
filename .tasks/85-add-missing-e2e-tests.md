# Task 85: Add Missing E2E Tests

**Status:** PENDING
**Priority:** HIGH
**Estimated Effort:** 8-12 hours
**Dependencies:** None
**Agent Required:** testing

## Overview

Add missing E2E tests identified in Task 83 comprehensive review to achieve complete test coverage for UI components and critical workflows, per CLAUDE.md guidelines.

## Missing E2E Tests

### 1. DataTable Storybook Stories (HIGH PRIORITY)
**Estimated Effort:** 4-6 hours
**Impact:** Critical - DataTable is core component with 19 Storybook stories

**File to Create:** `tests/e2e/data-table.storybook.spec.ts`

**Stories to Test:**
- Default (3 results with mixed types)
- LargeDataset10000 (performance story with 10,000 rows)
- ColumnSorting (verify sorting by column)
- ColumnFiltering (verify filter functionality)
- ColumnResizing (verify column resize)
- ColumnVisibility (verify hide/show columns)
- ClickableLinks (verify URI links open)
- StyledLiterals (verify language tags, datatypes)
- IriAbbreviation (verify prefix abbreviations)
- EmptyResults (verify empty state)
- UnboundVariables (verify handling of missing values)

**Test Implementation:**
```typescript
import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('DataTable Stories', () => {
  test('Default story should render table with 3 results', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-datatable--default&viewMode=story`);
    await page.waitForTimeout(1500);

    // Verify table renders
    await expect(page.locator('.wx-grid')).toBeVisible();

    // Verify result count
    await expect(page.getByText('3 results')).toBeVisible();

    // Verify columns
    await expect(page.getByRole('columnheader', { name: 's' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'p' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'o' })).toBeVisible();
  });

  test('LargeDataset10000 story should handle virtual scrolling', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-datatable--large-dataset10000&viewMode=story`);
    await page.waitForTimeout(3000); // Allow time for pre-computation

    // Verify table renders
    await expect(page.locator('.wx-grid')).toBeVisible({ timeout: 10000 });

    // Verify large dataset loaded
    await expect(page.getByText('10,000 results')).toBeVisible();

    // Verify virtual scrolling (only visible rows in DOM)
    const rows = await page.locator('.wx-grid-row').count();
    expect(rows).toBeLessThan(100); // Virtual scrolling active
  });

  test('ClickableLinks story should have working URI links', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-datatable--clickable-links&viewMode=story`);
    await page.waitForTimeout(1500);

    // Verify URI link exists
    const link = page.getByRole('link', { name: /dbpedia\.org/i }).first();
    await expect(link).toBeVisible();

    // Verify link attributes
    expect(await link.getAttribute('target')).toBe('_blank');
    expect(await link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  test('ColumnSorting story should sort columns', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-datatable--column-sorting&viewMode=story`);
    await page.waitForTimeout(1500);

    // Click column header to sort
    await page.getByRole('columnheader', { name: 'name' }).click();

    // Verify sort indicator appears
    // (Implementation depends on wx-svelte-grid sort indicator)
  });
});
```

### 2. Download Functionality E2E Test (HIGH PRIORITY)
**Estimated Effort:** 2-3 hours
**Impact:** Download is core user feature

**File to Create:** `tests/e2e/download.storybook.spec.ts`

**Test Implementation:**
```typescript
import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Download Functionality', () => {
  test('should show download button on query completion', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--with-results&viewMode=story`);
    await page.waitForTimeout(1500);

    // Verify download button exists
    const downloadButton = page.getByRole('button', { name: /download/i });
    await expect(downloadButton).toBeVisible();
  });

  test('should trigger download on button click', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--with-results&viewMode=story`);
    await page.waitForTimeout(1500);

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.getByRole('button', { name: /download/i }).click();

    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/results\.(json|csv|tsv)/);
  });

  test('should support multiple download formats', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--with-results&viewMode=story`);
    await page.waitForTimeout(1500);

    // Test JSON download
    const downloadButton = page.getByRole('button', { name: /download/i });
    await downloadButton.click();

    // Verify format selector appears (if implemented)
    // OR verify default format downloads
  });
});
```

### 3. Error Recovery E2E Test (MEDIUM PRIORITY)
**Estimated Effort:** 2-3 hours
**Impact:** Ensures robust error handling

**File to Create:** `tests/e2e/error-recovery.storybook.spec.ts`

**Test Implementation:**
```typescript
import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Error Recovery', () => {
  test('should show error notification on query failure', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--with-error&viewMode=story`);
    await page.waitForTimeout(1500);

    // Verify error notification visible
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/error/i)).toBeVisible();
  });

  test('should allow retry after error', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--with-error&viewMode=story`);
    await page.waitForTimeout(1500);

    // Look for retry/try again button
    const retryButton = page.getByRole('button', { name: /try again|retry/i });

    if (await retryButton.isVisible()) {
      await retryButton.click();
      // Verify some action occurs (depends on story implementation)
    }
  });

  test('should display helpful CORS error message', async ({ page }) => {
    // This requires a story that simulates CORS error
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=results-errornotification--cors-error&viewMode=story`);
    await page.waitForTimeout(1500);

    // Verify CORS-specific guidance
    await expect(page.getByText(/cors/i)).toBeVisible();
    await expect(page.getByText(/cross-origin/i)).toBeVisible();
  });
});
```

## Implementation Steps

### Step 1: Create DataTable E2E Tests (4-6 hours)

1. Create `tests/e2e/data-table.storybook.spec.ts`
2. Add tests for all 19 DataTable stories
3. Use semantic selectors (getByRole, getByText)
4. Verify rendering, interactions, and accessibility
5. Test performance stories with increased timeouts

### Step 2: Create Download E2E Tests (2-3 hours)

1. Create `tests/e2e/download.storybook.spec.ts`
2. Test download button visibility and click
3. Test download event triggers
4. Verify file name and format
5. Test multiple format support (if implemented)

### Step 3: Create Error Recovery E2E Tests (2-3 hours)

1. Create `tests/e2e/error-recovery.storybook.spec.ts`
2. Test error notification display
3. Test retry functionality
4. Test CORS error messaging
5. Test timeout error messaging

### Step 4: Run and Verify All E2E Tests (30 minutes)

```bash
# Start Storybook
npm run storybook &

# Wait for Storybook to be ready
timeout 30 bash -c 'until curl -s http://localhost:6006 > /dev/null; do sleep 1; done'

# Run all E2E tests
npm run test:e2e:storybook

# Verify all tests pass
```

## Acceptance Criteria

- ✅ `data-table.storybook.spec.ts` created with tests for all 19 stories
- ✅ `download.storybook.spec.ts` created with download functionality tests
- ✅ `error-recovery.storybook.spec.ts` created with error handling tests
- ✅ All E2E tests use semantic selectors (getByRole, getByText, getByLabel)
- ✅ Tests handle Storybook initialization wait (1500ms)
- ✅ Performance stories use appropriate timeouts (3-10 seconds)
- ✅ All E2E tests pass: `npm run test:e2e:storybook`
- ✅ Build passes: `npm run build`
- ✅ Test coverage includes:
  - Table rendering and data display
  - Column sorting, filtering, resizing, visibility
  - Virtual scrolling with large datasets
  - Clickable links and styled literals
  - Download functionality
  - Error handling and recovery

## Testing Strategy

1. **Test Development:**
   - Write tests incrementally (one story at a time)
   - Run individual tests to verify: `npx playwright test --config=playwright-storybook.config.js tests/e2e/data-table.storybook.spec.ts -g "Default story"`
   - Fix issues before moving to next test

2. **Semantic Selector Usage:**
   - Prefer `getByRole()`, `getByText()`, `getByLabel()`
   - Avoid CSS class selectors
   - Use `{ name: /pattern/ }` for flexible matching
   - Handle strict mode violations with `.first()` or `.nth()`

3. **Performance Testing:**
   - Use longer timeouts for large dataset stories (5-10 seconds)
   - Verify virtual scrolling active (row count < total dataset size)
   - Check for browser freezes or timeouts

4. **Error Handling:**
   - Verify error messages displayed
   - Check for recovery options (retry buttons)
   - Test different error types (network, CORS, syntax, timeout)

## Success Criteria

- ✅ All new E2E test files created
- ✅ All DataTable stories have corresponding E2E tests
- ✅ Download functionality verified in browser
- ✅ Error recovery workflows tested
- ✅ All tests pass consistently
- ✅ Tests use semantic selectors for accessibility verification
- ✅ No flaky tests detected
- ✅ Test coverage increased from current baseline

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [CLAUDE.md - E2E Testing Workflow](../.claude/CLAUDE.md#e2e-testing-workflow)
- [CLAUDE.md - Playwright Semantic Selectors](../.claude/CLAUDE.md#playwright-e2e-testing-best-practices)
- [Task 83 - Comprehensive Review](./83-comprehensive-project-review.md)
- [Task 55 - E2E Testing Lessons Learned](./55-fix-function-library-storybook-error.md)
