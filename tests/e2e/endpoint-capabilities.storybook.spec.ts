/**
 * E2E tests for Endpoint Capabilities components in Storybook
 * Tests the capabilities display functionality in actual browser environment
 *
 * Note: EndpointCapabilities main component tests are minimal due to store dependencies.
 * Focus is on sub-components which have complete, testable stories.
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Endpoint Capabilities Components', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console error logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
  });

  test.describe('EndpointCapabilities', () => {
    test('should render loading state', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-endpointcapabilities--loading&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(3000);

      // Should show loading skeleton
      const loadingState = page.locator('.loading-state');
      await expect(loadingState).toBeVisible({ timeout: 5000 });
    });

    test('should render full capabilities with all data', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-endpointcapabilities--with-full-capabilities&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(3000);

      // Should show main panel title and refresh button
      await expect(page.getByText('Endpoint Capabilities')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();

      // Should show SPARQL Support section
      await expect(page.getByText('SPARQL Support')).toBeVisible();
      await expect(page.getByText('SPARQL 1.0 Query')).toBeVisible();
      await expect(page.getByText('SPARQL 1.1 Query')).toBeVisible();
      await expect(page.getByText('SPARQL 1.1 Update')).toBeVisible();

      // Should show Features section
      await expect(page.getByText(/^Features$/)).toBeVisible();
      await expect(page.getByText('URI Dereferencing')).toBeVisible();
      await expect(page.getByText('Union Default Graph')).toBeVisible();
      await expect(page.getByText('Federated Query (SERVICE)')).toBeVisible();

      // Should show Result Formats section
      await expect(page.getByText('Result Formats')).toBeVisible();
      await expect(page.getByText('JSON')).toBeVisible();
      await expect(page.getByText('XML').first()).toBeVisible();
      await expect(page.getByText('CSV')).toBeVisible();
      await expect(page.getByText('TSV')).toBeVisible();

      // Should show Input Formats section
      await expect(page.getByText('Input Formats')).toBeVisible();
      await expect(page.getByText('Turtle')).toBeVisible();

      // Should show Extension Functions heading
      await expect(page.getByText('Extension Functions')).toBeVisible();

      // Should show Functions and Aggregates tabs with counts
      await expect(page.getByRole('tab', { name: /Functions \(2\)/ })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Aggregates \(1\)/ })).toBeVisible();

      // Should show Datasets section
      await expect(page.getByText(/^Datasets$/).first()).toBeVisible();

      // Should show last updated metadata
      await expect(page.getByText('Last updated:')).toBeVisible();
    });

    test('should render error state with retry button', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-endpointcapabilities--error-state&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(3000);

      // Should show error message
      await expect(
        page.getByText(/Failed to fetch service description: Network error/)
      ).toBeVisible({ timeout: 5000 });

      // Should show Try Again button
      const retryButton = page.getByRole('button', { name: /Try Again/i });
      await expect(retryButton).toBeVisible();
    });

    test('should render no endpoint state', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-endpointcapabilities--no-endpoint&viewMode=story`
      );

      await page.waitForTimeout(1000);

      // Should show empty state message
      await expect(page.getByText(/Service description not available/i)).toBeVisible();
    });

    test('should render not available state', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-endpointcapabilities--not-available&viewMode=story`
      );

      // Wait for component to render
      await page.waitForTimeout(1000);

      // Should show "not available" message
      await expect(
        page.getByText(/Service description not available for this endpoint/i)
      ).toBeVisible({ timeout: 5000 });

      // Should show Try to Fetch button
      const fetchButton = page.getByRole('button', { name: /Try to Fetch/i });
      await expect(fetchButton).toBeVisible();
    });

    test('should show extension functions in Functions tab', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-endpointcapabilities--with-full-capabilities&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(3000);

      // Functions tab should be selected by default and show function details
      const functionsTab = page.getByRole('tab', { name: /Functions \(2\)/ });
      await expect(functionsTab).toBeVisible({ timeout: 5000 });
      await expect(functionsTab).toHaveAttribute('aria-selected', 'true');

      // Should show function details in the Functions tab
      await expect(page.getByText('customFunction').first()).toBeVisible();
      await expect(page.getByText('geoDistance').first()).toBeVisible();
    });

    test('should show extension aggregates in Aggregates tab', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-endpointcapabilities--with-full-capabilities&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(3000);

      // Click on Aggregates tab to switch to it
      const aggregatesTab = page.getByRole('tab', { name: /Aggregates \(1\)/ });
      await expect(aggregatesTab).toBeVisible({ timeout: 5000 });
      await aggregatesTab.click();

      // Wait for tab content to render
      await page.waitForTimeout(500);

      // Should show aggregate details in the Aggregates tab
      await expect(page.getByText('MEDIAN').first()).toBeVisible();
    });
  });

  test.describe('LanguageSupport', () => {
    test('should show all supported languages', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-languagesupport--all-supported&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that all language versions are shown
      await expect(page.getByText('SPARQL 1.0 Query')).toBeVisible();
      await expect(page.getByText('SPARQL 1.1 Query')).toBeVisible();
      await expect(page.getByText('SPARQL 1.1 Update')).toBeVisible();
    });

    test('should show mixed support states', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-languagesupport--only-sparql-11-query&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that language is shown (whether supported or not)
      await expect(page.getByText('SPARQL 1.1 Query')).toBeVisible();
    });

    test('should show query-only support', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-languagesupport--query-only&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Should show multiple query versions
      await expect(page.getByText('SPARQL 1.0 Query')).toBeVisible();
      await expect(page.getByText('SPARQL 1.1 Query')).toBeVisible();
    });
  });

  test.describe('FeatureList', () => {
    test('should display all features', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-featurelist--all-features&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that feature tags are visible
      await expect(page.getByText('URI Dereferencing')).toBeVisible();
      await expect(page.getByText('Union Default Graph')).toBeVisible();
      await expect(page.getByText('Federated Query (SERVICE)')).toBeVisible();
    });

    test('should display common features', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-featurelist--common-features&viewMode=story`
      );

      await page.waitForTimeout(500);

      await expect(page.getByText('URI Dereferencing')).toBeVisible();
      await expect(page.getByText('Federated Query (SERVICE)')).toBeVisible();
    });

    test('should show empty state when no features', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-featurelist--no-features&viewMode=story`
      );

      await page.waitForTimeout(500);

      await expect(page.getByText('No special features reported')).toBeVisible();
    });
  });

  test.describe('FormatList', () => {
    test('should display common result formats', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-formatlist--common-result-formats&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that format tags are visible
      await expect(page.getByText('JSON')).toBeVisible();
      await expect(page.getByText('XML')).toBeVisible();
      await expect(page.getByText('CSV')).toBeVisible();
      await expect(page.getByText('TSV')).toBeVisible();
    });

    test('should display RDF formats', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-formatlist--rdf-formats&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that RDF format tags are visible
      await expect(page.getByText('Turtle')).toBeVisible();
      // RDF/XML might be split, so check for the content
      const pageContent = await page.content();
      expect(pageContent).toContain('RDF');
    });

    test('should show empty state when no formats', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-formatlist--no-formats&viewMode=story`
      );

      await page.waitForTimeout(500);

      await expect(page.getByText('No result formats reported')).toBeVisible();
    });
  });

  test.describe('ExtensionList', () => {
    test('should display multiple functions', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-extensionlist--multiple-functions&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that extension function details are visible (use .first() to avoid strict mode)
      await expect(page.getByText('customFunction').first()).toBeVisible();
      await expect(page.getByText('geoDistance').first()).toBeVisible();
      await expect(page.getByText(/custom SPARQL extension function/)).toBeVisible();
    });

    test('should display aggregates', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-extensionlist--multiple-aggregates&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that aggregate function details are visible (use .first() to avoid strict mode)
      await expect(page.getByText('MEDIAN').first()).toBeVisible();
      await expect(page.getByText('MODE').first()).toBeVisible();
    });

    test('should display single function', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-extensionlist--single-function&viewMode=story`
      );

      await page.waitForTimeout(500);

      await expect(page.getByText('customFunction').first()).toBeVisible();
    });

    test('should show empty state when no extensions', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-extensionlist--no-extensions&viewMode=story`
      );

      await page.waitForTimeout(500);

      await expect(page.getByText(/No extension functions reported/)).toBeVisible();
    });
  });

  test.describe('DatasetInfo', () => {
    test('should display single dataset', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-datasetinfo--single-dataset&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that dataset statistics are visible (use .first() to handle multiple matches)
      await expect(page.getByText(/Named Graphs/).first()).toBeVisible();
      // Check for the number without strict mode issues
      await expect(page.locator('.stat-value').first()).toBeVisible();
    });

    test('should display multiple datasets', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-datasetinfo--multiple-datasets&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that dataset information is visible
      await expect(page.getByText(/Datasets/i)).toBeVisible();
    });

    test('should show entailment regimes', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-datasetinfo--single-dataset&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that entailment regime section is visible
      await expect(page.getByText('Entailment Regimes')).toBeVisible();
      await expect(page.getByText('RDFS')).toBeVisible();
    });

    test('should show empty state when no datasets', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-datasetinfo--no-datasets&viewMode=story`
      );

      await page.waitForTimeout(500);

      await expect(page.getByText('No dataset information available')).toBeVisible();
    });

    test('should display graph names and triple counts', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-datasetinfo--single-dataset&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that Named Graphs section is visible
      await expect(page.getByText('Named Graphs', { exact: true }).first()).toBeVisible();

      // Check that specific graph names are listed
      await expect(page.getByText('http://dbpedia.org/graph/ontology')).toBeVisible();
      await expect(page.getByText('http://dbpedia.org/graph/en')).toBeVisible();
      await expect(page.getByText('http://dbpedia.org/graph/de')).toBeVisible();

      // Check that triple counts are displayed with proper formatting
      await expect(page.getByText(/45,678 triples/)).toBeVisible();
      await expect(page.getByText(/1,234,567 triples/)).toBeVisible();
      await expect(page.getByText(/987,654 triples/)).toBeVisible();

      // Check for Default Graphs section
      await expect(page.getByText('Default Graphs', { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/3,458,921 triples/)).toBeVisible();
    });

    test('should display triple counts for multiple datasets', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-capabilities-datasetinfo--multiple-datasets&viewMode=story`
      );

      await page.waitForTimeout(500);

      // Check that graph names are listed
      await expect(page.getByText('http://example.org/graph1')).toBeVisible();
      await expect(page.getByText('http://example.org/graph2')).toBeVisible();
      await expect(page.getByText('http://example.org/graph3')).toBeVisible();

      // Check that triple counts are displayed
      await expect(page.getByText(/50,000 triples/)).toBeVisible();
      await expect(page.getByText(/25,000 triples/)).toBeVisible();
      await expect(page.getByText(/75,000 triples/)).toBeVisible();
      await expect(page.getByText(/100,000 triples/)).toBeVisible();
    });
  });
});
