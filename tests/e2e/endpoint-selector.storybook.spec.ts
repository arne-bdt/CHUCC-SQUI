/**
 * E2E tests for EndpointSelector component in Storybook
 * Tests the initial value display and dropdown functionality
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('EndpointSelector Component', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console error logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
  });

  test('DBpediaSelected: should display "DBpedia" text on initial load', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=endpoint-endpointselector--d-bpedia-selected&viewMode=story`
    );

    // Wait for Storybook to fully initialize story
    await page.waitForTimeout(3000);

    // Debug: Check what's actually on the page
    const bodyHTML = await page.locator('body').innerHTML();
    console.log(`[DEBUG] Page HTML (first 500 chars):\n${bodyHTML.substring(0, 500)}`);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/endpoint-selector-dbpedia.png' });

    // Try to find any input element
    const anyInput = page.locator('input').first();
    const inputCount = await page.locator('input').count();
    console.log(`[DEBUG] Number of inputs on page: ${inputCount}`);

    if (inputCount > 0) {
      await expect(anyInput).toBeVisible({ timeout: 5000 });
      const inputValue = await anyInput.inputValue();
      console.log(`[DEBUG] Input value: "${inputValue}"`);
      expect(inputValue).toBe('DBpedia');
    } else {
      throw new Error('No input elements found on the page!');
    }
  });

  test('WikidataSelected: should display "Wikidata" text on initial load', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=endpoint-endpointselector--wikidata-selected&viewMode=story`
    );

    await page.waitForTimeout(3000);

    const comboboxInput = page.locator('.bx--text-input, input[role="combobox"]').first();
    await expect(comboboxInput).toBeVisible({ timeout: 5000 });

    const inputValue = await comboboxInput.inputValue();
    console.log(`[DEBUG] ComboBox input value: "${inputValue}"`);

    expect(inputValue).toBe('Wikidata');
  });

  test('UniProtSelected: should display "UniProt" text on initial load', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=endpoint-endpointselector--uni-prot-selected&viewMode=story`
    );

    await page.waitForTimeout(3000);

    const comboboxInput = page.locator('.bx--text-input, input[role="combobox"]').first();
    await expect(comboboxInput).toBeVisible({ timeout: 5000 });

    const inputValue = await comboboxInput.inputValue();
    console.log(`[DEBUG] ComboBox input value: "${inputValue}"`);

    expect(inputValue).toBe('UniProt');
  });

  test('CustomEndpoint: should display URL when not in catalogue', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=endpoint-endpointselector--custom-endpoint&viewMode=story`
    );

    await page.waitForTimeout(3000);

    const comboboxInput = page.locator('.bx--text-input, input[role="combobox"]').first();
    await expect(comboboxInput).toBeVisible({ timeout: 5000 });

    const inputValue = await comboboxInput.inputValue();
    console.log(`[DEBUG] ComboBox input value: "${inputValue}"`);

    // Custom endpoints should display the full URL
    expect(inputValue).toContain('my-custom-endpoint.org');
  });

  test('Default: should show placeholder when no value', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=endpoint-endpointselector--default&viewMode=story`
    );

    await page.waitForTimeout(3000);

    const comboboxInput = page.locator('.bx--text-input, input[role="combobox"]').first();
    await expect(comboboxInput).toBeVisible({ timeout: 5000 });

    const inputValue = await comboboxInput.inputValue();
    console.log(`[DEBUG] ComboBox input value: "${inputValue}"`);

    // Should be empty or show placeholder (not a URL)
    expect(inputValue).toBe('');
  });

  test('should open dropdown and show options when clicked', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=endpoint-endpointselector--default&viewMode=story`
    );

    await page.waitForTimeout(3000);

    const comboboxInput = page.locator('.bx--text-input, input[role="combobox"]').first();
    await expect(comboboxInput).toBeVisible({ timeout: 5000 });

    // Click to open dropdown
    await comboboxInput.click();
    await page.waitForTimeout(500);

    // Should show dropdown options
    await expect(page.getByText('DBpedia')).toBeVisible();
    await expect(page.getByText('Wikidata')).toBeVisible();
    await expect(page.getByText('UniProt')).toBeVisible();
    await expect(page.getByText('LOD Cloud')).toBeVisible();
  });

  test('should update display after selecting from dropdown', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=endpoint-endpointselector--default&viewMode=story`
    );

    await page.waitForTimeout(3000);

    const comboboxInput = page.locator('.bx--text-input, input[role="combobox"]').first();

    // Initially empty
    let inputValue = await comboboxInput.inputValue();
    expect(inputValue).toBe('');

    // Click to open dropdown
    await comboboxInput.click();
    await page.waitForTimeout(500);

    // Click on DBpedia option
    await page.getByText('DBpedia').click();
    await page.waitForTimeout(500);

    // Should now show "DBpedia" in the input
    inputValue = await comboboxInput.inputValue();
    console.log(`[DEBUG] After selection, input value: "${inputValue}"`);
    expect(inputValue).toBe('DBpedia');
  });
});
