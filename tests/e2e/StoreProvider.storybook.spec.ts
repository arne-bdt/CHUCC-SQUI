import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('StoreProvider Component', () => {
  test.describe('Default Story', () => {
    test('should render StoreProvider with default values', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--default&viewMode=story`);

      // Wait for story to load
      await page.waitForTimeout(1500);

      // Verify demo heading
      await expect(page.getByRole('heading', { name: 'StoreProvider Demo' })).toBeVisible();

      // Verify store values section
      await expect(page.getByRole('heading', { name: 'Store Values' })).toBeVisible();

      // Verify empty query text
      await expect(page.getByText('Query Text:')).toBeVisible();
      await expect(page.getByText('(empty)').first()).toBeVisible();

      // Verify empty endpoint
      await expect(page.getByText('Endpoint:')).toBeVisible();

      // Verify active tab
      await expect(page.getByText('Active Tab:')).toBeVisible();
      await expect(page.getByText('tab-1')).toBeVisible();

      // Verify loading state
      await expect(page.getByText('Loading:')).toBeVisible();
      await expect(page.getByText('false')).toBeVisible();
    });
  });

  test.describe('WithInitialQuery Story', () => {
    test('should render with initial query text', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--with-initial-query&viewMode=story`);

      await page.waitForTimeout(1500);

      // Verify query text is populated
      await expect(page.getByText('Query Text:')).toBeVisible();
      await expect(page.getByText('SELECT * WHERE { ?s ?p ?o }')).toBeVisible();
    });
  });

  test.describe('WithInitialEndpoint Story', () => {
    test('should render with initial endpoint URL', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--with-initial-endpoint&viewMode=story`);

      await page.waitForTimeout(1500);

      // Verify endpoint is populated
      await expect(page.getByText('Endpoint:')).toBeVisible();
      await expect(page.getByText('https://dbpedia.org/sparql')).toBeVisible();
    });
  });

  test.describe('WithInitialValues Story', () => {
    test('should render with both initial query and endpoint', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--with-initial-values&viewMode=story`);

      await page.waitForTimeout(1500);

      // Verify query text
      await expect(page.getByText('Query Text:')).toBeVisible();
      await expect(page.getByText(/PREFIX rdf:/)).toBeVisible();
      await expect(page.getByText(/SELECT \* WHERE/)).toBeVisible();

      // Verify endpoint
      await expect(page.getByText('Endpoint:')).toBeVisible();
      await expect(page.getByText('https://query.wikidata.org/sparql')).toBeVisible();
    });
  });

  test.describe('MultipleInstances Story', () => {
    test('should render multiple isolated instances', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--multiple-instances&viewMode=story`);

      await page.waitForTimeout(1500);

      // Verify heading
      await expect(page.getByRole('heading', { name: 'Multiple Isolated Instances' })).toBeVisible();

      // Verify Instance 1 heading
      await expect(page.getByRole('heading', { name: 'Instance 1' })).toBeVisible();

      // Verify Instance 2 heading
      await expect(page.getByRole('heading', { name: 'Instance 2' })).toBeVisible();

      // Verify both instances show Query Text
      const queryLabels = page.getByText('Query Text:');
      await expect(queryLabels).toHaveCount(2);

      // Verify both instances show Endpoint
      const endpointLabels = page.getByText('Endpoint:');
      await expect(endpointLabels).toHaveCount(2);

      // Verify Instance 1 has DBpedia endpoint
      await expect(page.getByText('https://dbpedia.org/sparql')).toBeVisible();

      // Verify Instance 2 has Wikidata endpoint
      await expect(page.getByText('https://query.wikidata.org/sparql')).toBeVisible();

      // Verify isolation notice
      await expect(page.getByText(/Each instance has completely independent state/)).toBeVisible();
    });

    test('should show different queries for each instance', async ({ page }) => {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--multiple-instances&viewMode=story`);

      await page.waitForTimeout(1500);

      // Instance 1 should have LIMIT 10
      await expect(page.getByText(/LIMIT 10/)).toBeVisible();

      // Instance 2 should have PREFIX wd:
      await expect(page.getByText(/PREFIX wd:/)).toBeVisible();
    });
  });

  test.describe('State Isolation', () => {
    test('should not share state between stories', async ({ page }) => {
      // Navigate to WithInitialQuery story
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--with-initial-query&viewMode=story`);
      await page.waitForTimeout(1500);

      // Verify query is present
      await expect(page.getByText('SELECT * WHERE { ?s ?p ?o }')).toBeVisible();

      // Navigate to Default story (should have empty query)
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-storeprovider--default&viewMode=story`);
      await page.waitForTimeout(1500);

      // Verify query is empty (not carried over from previous story)
      await expect(page.getByText('(empty)').first()).toBeVisible();

      // Verify no remnants of previous query
      const pageContent = await page.textContent('body');
      expect(pageContent).not.toContain('SELECT * WHERE { ?s ?p ?o }');
    });
  });
});
