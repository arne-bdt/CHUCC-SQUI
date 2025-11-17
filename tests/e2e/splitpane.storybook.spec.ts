/**
 * E2E Accessibility Tests for SplitPane Component
 *
 * Tests ARIA attributes, focus indicators, and touch target compliance
 * in a real browser environment using Playwright and Storybook.
 *
 * Requirements tested:
 * - ARIA attributes (role, orientation, valuenow, valuemin, valuemax, label)
 * - 44px minimum touch target (WCAG 2.5.5)
 * - Focus indicators on keyboard focus
 * - Keyboard accessibility (element is focusable)
 *
 * Note: Exact keyboard behavior (ArrowUp/ArrowDown increments) is tested
 * in integration tests with controlled DOM environment.
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';

test.describe('SplitPane Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Default story
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-splitpane--default&viewMode=story`, {
      waitUntil: 'networkidle',
    });
    // Wait for Storybook play function to complete
    await page.waitForTimeout(1500);
  });

  test.describe('ARIA Attributes', () => {
    test('should render divider with proper ARIA attributes', async ({ page }) => {
      // Find divider by role="separator"
      const divider = page.locator('[role="separator"]');
      await expect(divider).toBeVisible({ timeout: 5000 });

      // Verify ARIA attributes
      await expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
      await expect(divider).toHaveAttribute('aria-valuemin', '0');
      await expect(divider).toHaveAttribute('aria-valuemax', '100');

      // Verify aria-valuenow exists and is a valid number in range 0-100
      const valuenow = await divider.getAttribute('aria-valuenow');
      expect(valuenow).toBeTruthy();
      const valuenowNum = Number(valuenow);
      expect(valuenowNum).toBeGreaterThanOrEqual(0);
      expect(valuenowNum).toBeLessThanOrEqual(100);

      // Verify aria-label exists and has meaningful text
      const ariaLabel = await divider.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Resize');
      expect(ariaLabel).toContain('arrow');
    });

    test('should have correct aria-valuenow for different split ratios', async ({ page }) => {
      // Navigate to TopHeavy story (70% split)
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-splitpane--top-heavy&viewMode=story`);
      await page.waitForTimeout(1500);

      const divider = page.locator('[role="separator"]');
      await expect(divider).toHaveAttribute('aria-valuenow', '70');
    });

    test('should have tabindex for keyboard accessibility', async ({ page }) => {
      const divider = page.locator('[role="separator"]');
      await expect(divider).toHaveAttribute('tabindex', '0');
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should be keyboard navigable with Tab', async ({ page }) => {
      const divider = page.locator('[role="separator"]');

      // Verify divider can receive focus via Tab key
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('role') === 'separator';
      });

      expect(focused).toBe(true);
    });

    test('should be focusable programmatically', async ({ page }) => {
      const divider = page.locator('[role="separator"]');
      await expect(divider).toBeVisible();

      // Verify initial ARIA state is valid
      const initialValue = await divider.getAttribute('aria-valuenow');
      const initialNum = Number(initialValue);
      expect(initialNum).toBeGreaterThanOrEqual(0);
      expect(initialNum).toBeLessThanOrEqual(100);

      // Verify divider can be focused (keyboard accessible)
      await divider.focus();
      await expect(divider).toBeFocused();

      // Verify ARIA label provides keyboard instructions
      const ariaLabel = await divider.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.toLowerCase()).toContain('arrow');
    });

    test('should have keyboard instructions in aria-label', async ({ page }) => {
      const divider = page.locator('[role="separator"]');

      const ariaLabel = await divider.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      // Verify label mentions keyboard usage
      const labelLower = ariaLabel?.toLowerCase() || '';
      expect(labelLower).toContain('arrow');
      expect(labelLower.includes('up') || labelLower.includes('down')).toBe(true);
    });

    test('should render with minimum constraints story', async ({ page }) => {
      // Navigate to WithConstraints story
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-splitpane--with-constraints&viewMode=story`);
      await page.waitForTimeout(1500);

      const divider = page.locator('[role="separator"]');

      // Verify story loaded correctly
      await expect(divider).toBeVisible();

      // Verify initial value is in valid range
      const initialValue = await divider.getAttribute('aria-valuenow');
      const initialNum = Number(initialValue);
      expect(initialNum).toBeGreaterThanOrEqual(0);
      expect(initialNum).toBeLessThanOrEqual(100);

      // Verify divider is keyboard accessible
      await divider.focus();
      await expect(divider).toBeFocused();

      // Verify ARIA attributes are present
      await expect(divider).toHaveAttribute('aria-valuemin', '0');
      await expect(divider).toHaveAttribute('aria-valuemax', '100');
    });
  });

  test.describe('Focus Indicators', () => {
    test('should have visible focus indicator on keyboard focus', async ({ page }) => {
      const divider = page.locator('[role="separator"]');

      // Focus the divider using Tab key
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      // Verify element is focused
      await expect(divider).toBeFocused();

      // Check for focus-visible outline
      const outlineStyle = await divider.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
          outlineStyle: styles.outlineStyle,
        };
      });

      // Should have visible outline (focus-visible styles)
      const hasOutline =
        outlineStyle.outline !== 'none' ||
        (outlineStyle.outlineWidth !== '0px' &&
          outlineStyle.outlineWidth !== '' &&
          outlineStyle.outlineStyle !== 'none');

      expect(hasOutline).toBe(true);
    });

    test('should be clickable with mouse', async ({ page }) => {
      const divider = page.locator('[role="separator"]');

      // Verify divider is visible and can be clicked
      await expect(divider).toBeVisible();

      // Click the divider with mouse (this starts drag operation)
      await divider.click();
      await page.waitForTimeout(200);

      // Divider should still be visible after click
      await expect(divider).toBeVisible();
    });
  });

  test.describe('Touch Target Size', () => {
    test('should have minimum 44px touch target', async ({ page }) => {
      const dividerContainer = page.locator('.split-pane-divider-container');
      await expect(dividerContainer).toBeVisible();

      // Get bounding box
      const box = await dividerContainer.boundingBox();
      expect(box).toBeTruthy();

      // Verify height >= 44px (WCAG 2.5.5 compliance)
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('should have row-resize cursor', async ({ page }) => {
      const dividerContainer = page.locator('.split-pane-divider-container');

      const cursor = await dividerContainer.evaluate((el) => {
        return window.getComputedStyle(el).cursor;
      });

      expect(cursor).toBe('row-resize');
    });
  });

  test.describe('Visual Divider', () => {
    test('should render thin visual divider inside touch target', async ({ page }) => {
      const visibleDivider = page.locator('.split-pane-divider-visible');
      await expect(visibleDivider).toBeVisible();

      // Visual divider should be smaller than container (8px vs 44px)
      const box = await visibleDivider.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeLessThan(44);
    });

    test('should change color on hover', async ({ page }) => {
      const dividerContainer = page.locator('.split-pane-divider-container');
      const visibleDivider = page.locator('.split-pane-divider-visible');

      // Get initial background color
      const initialBg = await visibleDivider.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Hover over divider container
      await dividerContainer.hover();
      await page.waitForTimeout(300);

      // Get hover background color
      const hoverBg = await visibleDivider.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Color should change on hover
      expect(hoverBg).not.toBe(initialBg);
    });
  });

  test.describe('Component Structure', () => {
    test('should render top and bottom panes', async ({ page }) => {
      const topPane = page.locator('.split-pane-top');
      const bottomPane = page.locator('.split-pane-bottom');

      await expect(topPane).toBeVisible();
      await expect(bottomPane).toBeVisible();
    });

    test('should render with correct initial split ratio', async ({ page }) => {
      // Default story should have 50/50 split
      const divider = page.locator('[role="separator"]');
      await expect(divider).toHaveAttribute('aria-valuenow', '50');
    });

    test('should maintain pane structure', async ({ page }) => {
      const divider = page.locator('[role="separator"]');
      const topPane = page.locator('.split-pane-top');
      const bottomPane = page.locator('.split-pane-bottom');

      // Verify all elements are present
      await expect(divider).toBeVisible();
      await expect(topPane).toBeVisible();
      await expect(bottomPane).toBeVisible();

      // Verify divider is between panes (structural check)
      const dividerBox = await divider.boundingBox();
      const topBox = await topPane.boundingBox();
      const bottomBox = await bottomPane.boundingBox();

      expect(dividerBox).toBeTruthy();
      expect(topBox).toBeTruthy();
      expect(bottomBox).toBeTruthy();

      // Divider should be below top pane and above bottom pane
      expect(dividerBox!.y).toBeGreaterThanOrEqual(topBox!.y);
      expect(bottomBox!.y).toBeGreaterThanOrEqual(dividerBox!.y);
    });
  });

  test.describe('Multiple Split Ratios', () => {
    test('should render correctly with top-heavy split', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-splitpane--top-heavy&viewMode=story`);
      await page.waitForTimeout(1500);

      const divider = page.locator('[role="separator"]');
      await expect(divider).toHaveAttribute('aria-valuenow', '70');
    });

    test('should render correctly with bottom-heavy split', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-splitpane--bottom-heavy&viewMode=story`);
      await page.waitForTimeout(1500);

      const divider = page.locator('[role="separator"]');
      await expect(divider).toHaveAttribute('aria-valuenow', '30');
    });
  });

  test.describe('Theme Support', () => {
    test('should render in dark theme', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-splitpane--dark-theme&viewMode=story`);
      await page.waitForTimeout(1500);

      // Verify component renders without errors
      const divider = page.locator('[role="separator"]');
      await expect(divider).toBeVisible();

      // Verify ARIA attributes still present
      await expect(divider).toHaveAttribute('aria-valuenow', '50');
    });
  });
});
