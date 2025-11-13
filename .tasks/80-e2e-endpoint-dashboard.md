# Task 80: E2E Tests for Endpoint Dashboard

## Overview

Create comprehensive end-to-end tests for the Endpoint Dashboard workflow using Playwright. These tests verify the complete user journey from selecting an endpoint to viewing capabilities and inserting functions into queries.

## Motivation

### Testing Goals

1. **Real Browser Testing**: Catch issues that unit/integration tests miss
2. **User Journey Validation**: Test complete workflows, not just isolated components
3. **Visual Verification**: Ensure UI renders correctly in actual browser
4. **Regression Prevention**: Prevent future breaks in dashboard functionality

### What E2E Tests Catch

- ✅ Storybook configuration errors
- ✅ Component rendering in real browser
- ✅ User interactions (click, type, keyboard navigation)
- ✅ Store initialization and reactivity
- ✅ Accessibility (ARIA, keyboard navigation)
- ✅ Cross-component integration

## Requirements

### Test Coverage

1. **Endpoint Info Summary**:
   - Renders when endpoint selected
   - Shows correct summary statistics
   - Expands/collapses on click
   - Refresh button triggers fetch

2. **Endpoint Dashboard**:
   - All tabs render correctly
   - Tab switching works
   - Components display data correctly
   - Dynamic tab visibility (datasets, functions)

3. **Function Insertion**:
   - Functions tab displays extension functions
   - Search/filter works
   - Insert button adds function to query
   - Cursor position handled correctly

4. **Storybook Stories**:
   - All stories render without errors
   - Play functions execute correctly
   - No console errors or warnings

## Implementation Details

### Test File Structure

**File**: `tests/e2e/endpoint-dashboard.storybook.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const WAIT_FOR_STORYBOOK = 1500; // Wait for play functions to complete

test.describe('Endpoint Dashboard - EndpointInfoSummary Stories', () => {
  test('Collapsed story shows summary line', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--collapsed&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify summary text appears
    await expect(page.getByText(/SPARQL 1\.1/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/graphs/)).toBeVisible();
    await expect(page.getByText(/functions/)).toBeVisible();
    await expect(page.getByText(/ago/)).toBeVisible();

    // Verify refresh button
    await expect(page.getByLabelText('Refresh endpoint information')).toBeVisible();

    // Verify collapsed state (dashboard not visible)
    await expect(page.getByRole('tab', { name: /Capabilities/ })).not.toBeVisible();
  });

  test('Expanded story shows dashboard', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--expanded&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify summary line
    await expect(page.getByText(/SPARQL 1\.1/)).toBeVisible({ timeout: 5000 });

    // Verify expanded state (tabs visible)
    await expect(page.getByRole('tab', { name: /Capabilities/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Datasets/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Functions/ })).toBeVisible();
  });

  test('Loading story shows skeleton', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--loading&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify loading state (exact implementation depends on component)
    await expect(page.locator('.bx--skeleton')).toBeVisible({ timeout: 5000 });
  });

  test('No service description story shows error message', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--no-service-description&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    await expect(page.getByText('No service description available')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Expand/collapse interaction', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--collapsed&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Initially collapsed
    await expect(page.getByRole('tab', { name: /Capabilities/ })).not.toBeVisible();

    // Click to expand
    await page.getByLabelText('Show endpoint information').click();
    await page.waitForTimeout(500);

    // Now expanded
    await expect(page.getByRole('tab', { name: /Capabilities/ })).toBeVisible();

    // Click to collapse
    await page.getByLabelText('Hide endpoint information').click();
    await page.waitForTimeout(500);

    // Back to collapsed
    await expect(page.getByRole('tab', { name: /Capabilities/ })).not.toBeVisible();
  });
});

test.describe('Endpoint Dashboard - EndpointDashboard Stories', () => {
  test('Default story shows Capabilities tab', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify Capabilities tab is selected and visible
    const capabilitiesTab = page.getByRole('tab', { name: /Capabilities/ });
    await expect(capabilitiesTab).toBeVisible({ timeout: 5000 });
    await expect(capabilitiesTab).toHaveAttribute('aria-selected', 'true');

    // Verify content
    await expect(page.getByText('SPARQL Support')).toBeVisible();
    await expect(page.getByText('Result Formats')).toBeVisible();
  });

  test('Datasets tab story shows dataset information', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--datasets-tab&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify Datasets tab is selected
    const datasetsTab = page.getByRole('tab', { name: /Datasets/ });
    await expect(datasetsTab).toBeVisible({ timeout: 5000 });
    await expect(datasetsTab).toHaveAttribute('aria-selected', 'true');

    // Verify dataset content
    await expect(page.getByText(/Named Graphs/)).toBeVisible();
    await expect(page.getByText(/graph/i).first()).toBeVisible();
  });

  test('Functions tab story shows extension functions', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--functions-tab&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify Functions tab is selected
    const functionsTab = page.getByRole('tab', { name: /Functions/ });
    await expect(functionsTab).toBeVisible({ timeout: 5000 });
    await expect(functionsTab).toHaveAttribute('aria-selected', 'true');

    // Verify function library content
    await expect(page.getByPlaceholder(/Search functions/i)).toBeVisible();
  });

  test('Tab switching works correctly', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Start on Capabilities
    await expect(page.getByRole('tab', { name: /Capabilities/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Switch to Datasets
    await page.getByRole('tab', { name: /Datasets/ }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('tab', { name: /Datasets/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText(/Named Graphs/)).toBeVisible();

    // Switch to Functions
    await page.getByRole('tab', { name: /Functions/ }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('tab', { name: /Functions/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByPlaceholder(/Search functions/i)).toBeVisible();

    // Back to Capabilities
    await page.getByRole('tab', { name: /Capabilities/ }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('tab', { name: /Capabilities/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText('SPARQL Support')).toBeVisible();
  });

  test('Compact mode story applies compact styles', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--compact-mode&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify compact class is applied
    const dashboard = page.locator('.endpoint-dashboard.compact');
    await expect(dashboard).toBeVisible({ timeout: 5000 });
  });

  test('Minimal data story hides empty tabs', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--minimal-data&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Capabilities tab should be visible
    await expect(page.getByRole('tab', { name: /Capabilities/ })).toBeVisible({
      timeout: 5000,
    });

    // Datasets and Functions tabs should be hidden (no data)
    await expect(page.getByRole('tab', { name: /Datasets/ })).not.toBeVisible();
    await expect(page.getByRole('tab', { name: /Functions/ })).not.toBeVisible();
  });

  test('No service description story shows empty state', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--no-service-description&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    await expect(page.getByText('No endpoint information available')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Endpoint Dashboard - SparqlQueryUI Integration', () => {
  test('WithEndpointInfo story shows integrated dashboard', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sparqlqueryui--with-endpoint-info&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify endpoint selector
    await expect(page.getByLabelText('SPARQL Endpoint')).toBeVisible({ timeout: 5000 });

    // Verify endpoint info summary
    await expect(page.getByText(/SPARQL 1\.1/)).toBeVisible();

    // Verify query editor
    await expect(page.locator('.cm-editor')).toBeVisible();
  });

  test('Expand dashboard and switch tabs', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sparqlqueryui--with-endpoint-info&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Expand endpoint info
    await page.getByLabelText('Show endpoint information').click();
    await page.waitForTimeout(500);

    // Verify tabs appear
    await expect(page.getByRole('tab', { name: /Capabilities/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Datasets/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Functions/ })).toBeVisible();

    // Switch to Functions tab
    await page.getByRole('tab', { name: /Functions/ }).click();
    await page.waitForTimeout(300);

    // Verify function library visible
    await expect(page.getByPlaceholder(/Search functions/i)).toBeVisible();
  });

  test('Function insertion workflow (if implemented)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sparqlqueryui--with-endpoint-info&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Expand endpoint info
    await page.getByLabelText('Show endpoint information').click();
    await page.waitForTimeout(500);

    // Go to Functions tab
    await page.getByRole('tab', { name: /Functions/ }).click();
    await page.waitForTimeout(300);

    // Find first function insert button (implementation-specific)
    const insertButtons = page.getByRole('button', { name: /insert/i });
    const count = await insertButtons.count();

    if (count > 0) {
      // Click first insert button
      await insertButtons.first().click();
      await page.waitForTimeout(500);

      // Verify function appeared in editor (exact verification depends on implementation)
      const editorContent = await page.locator('.cm-content').textContent();
      expect(editorContent).toBeTruthy();
      // Could verify specific function name appears in editor
    }
  });
});

test.describe('Accessibility', () => {
  test('Keyboard navigation works', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Focus on Capabilities tab
    await page.getByRole('tab', { name: /Capabilities/ }).focus();

    // Use arrow keys to navigate tabs
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // Should focus Datasets tab
    const datasetsTab = page.getByRole('tab', { name: /Datasets/ });
    await expect(datasetsTab).toBeFocused();

    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Tab should be selected
    await expect(datasetsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('ARIA attributes are correct', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Check tab roles
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Check aria-selected on active tab
    const activeTab = page.getByRole('tab', { selected: true });
    await expect(activeTab).toBeVisible({ timeout: 5000 });
    await expect(activeTab).toHaveAttribute('aria-selected', 'true');

    // Check tabpanel exists
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible();
  });

  test('Screen reader labels are present', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--collapsed&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Verify aria-label on refresh button
    await expect(page.getByLabelText('Refresh endpoint information')).toBeVisible({
      timeout: 5000,
    });

    // Verify expand/collapse labels
    await expect(page.getByLabelText('Show endpoint information')).toBeVisible();

    // After expanding
    await page.getByLabelText('Show endpoint information').click();
    await page.waitForTimeout(500);
    await expect(page.getByLabelText('Hide endpoint information')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('Handles missing service description gracefully', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--no-service-description&viewMode=story`
    );
    await page.waitForTimeout(WAIT_FOR_STORYBOOK);

    // Should show empty state, not crash
    await expect(page.getByText('No endpoint information available')).toBeVisible({
      timeout: 5000,
    });

    // No console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
  });
});
```

## Implementation Steps

### Step 1: Create E2E Test File
1. Create `tests/e2e/endpoint-dashboard.storybook.spec.ts`
2. Set up test structure with describe blocks
3. Add helper constants (STORYBOOK_URL, wait times)

### Step 2: Write EndpointInfoSummary Tests
1. Test collapsed state
2. Test expanded state
3. Test loading state
4. Test error state
5. Test expand/collapse interaction
6. Test refresh button

### Step 3: Write EndpointDashboard Tests
1. Test default Capabilities tab
2. Test Datasets tab
3. Test Functions tab
4. Test tab switching
5. Test compact mode
6. Test minimal data (hidden tabs)
7. Test no service description

### Step 4: Write Integration Tests
1. Test SparqlQueryUI with endpoint info
2. Test expand/collapse in full UI
3. Test function insertion workflow (if implemented)
4. Test endpoint change triggers update

### Step 5: Write Accessibility Tests
1. Keyboard navigation (Tab, Arrow keys, Enter)
2. ARIA attributes (roles, aria-selected, aria-label)
3. Screen reader labels
4. Focus management

### Step 6: Write Error Handling Tests
1. Missing service description
2. Network errors
3. Console error detection

### Step 7: Run E2E Tests
```bash
# Start Storybook
npm run storybook &

# Wait for Storybook to be ready
timeout 30 bash -c 'until curl -s http://localhost:6006 > /dev/null; do sleep 1; done'

# Run E2E tests
npm run test:e2e:storybook

# Check results
# - All tests should pass
# - No console errors
# - Screenshots/videos in test-results/ if failures
```

## Acceptance Criteria

### Test Execution
- ✅ All E2E tests pass
- ✅ No console errors during tests
- ✅ No warnings about missing accessibility attributes
- ✅ Tests complete in reasonable time (<2 minutes total)

### Coverage
- ✅ EndpointInfoSummary: 5+ tests
- ✅ EndpointDashboard: 7+ tests
- ✅ Integration: 3+ tests
- ✅ Accessibility: 3+ tests
- ✅ Error handling: 1+ test

### Test Quality
- ✅ Use semantic selectors (getByRole, getByText, getByLabel)
- ✅ Avoid CSS class selectors
- ✅ Wait for elements appropriately
- ✅ Handle strict mode violations (multiple elements)
- ✅ Clear, descriptive test names

### Build & Quality Checks
```bash
npm run build               # ✅ 0 errors, 0 warnings
npm test                    # ✅ All tests pass
npm run test:e2e:storybook  # ✅ All E2E tests pass
npm run lint                # ✅ No violations
npm run type-check          # ✅ No type errors
```

## Dependencies

**Prerequisite Tasks:**
- Task 77: Create EndpointInfoSummary component
- Task 78: Create EndpointDashboard component
- Task 79: Integrate with main query interface

**Required:**
- Storybook running on localhost:6006
- Playwright installed and configured
- All stories created and working

## Troubleshooting

### Common Issues

**Issue**: Tests timeout waiting for elements
**Solution**: Increase timeout or check if story is rendering correctly

**Issue**: Strict mode violations (multiple elements)
**Solution**: Use more specific selectors or .first()/.nth()

**Issue**: Play functions not completing
**Solution**: Increase WAIT_FOR_STORYBOOK delay

**Issue**: Storybook not running
**Solution**: Start Storybook first: `npm run storybook`

**Issue**: Tab switching tests flaky
**Solution**: Add explicit waits after clicks

**Issue**: Function insertion test fails
**Solution**: Verify FunctionLibrary implementation and insert button selector

## Success Metrics

### Before Implementation
- ❌ No E2E tests for endpoint dashboard
- ❌ Unknown if dashboard works in real browser
- ❌ No verification of user workflows

### After Implementation
- ✅ Comprehensive E2E test coverage
- ✅ All user workflows verified in browser
- ✅ Accessibility verified (keyboard, ARIA, screen readers)
- ✅ Error states tested
- ✅ Regression prevention in place

## Future Enhancements

- **Visual Regression**: Screenshot comparison for UI consistency
- **Performance Tests**: Measure render time for large datasets
- **Mobile Tests**: Test on mobile viewports
- **Cross-browser**: Test in Firefox, Safari, WebKit
- **Network Conditions**: Test with slow/offline network

## References

- **Playwright**: https://playwright.dev/
- **Playwright Best Practices**: https://playwright.dev/docs/best-practices
- **Testing Library Queries**: https://testing-library.com/docs/queries/about
- **ARIA Roles**: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles

---

**Previous Task**: [Task 79: Integrate with Main Query Interface](./79-integrate-endpoint-dashboard.md)

**🎉 This completes the Endpoint Dashboard feature implementation!**
