import type { Preview, Decorator } from '@storybook/sveltekit';
import 'carbon-components-svelte/css/all.css';
import './preview.css';
import type { CarbonTheme, ServiceDescription } from '../src/lib/types';
import { resultsStore } from '../src/lib/stores/resultsStore';
import { queryStore } from '../src/lib/stores/queryStore';
import { serviceDescriptionStore } from '../src/lib/stores/serviceDescriptionStore';
import { serviceDescriptionCache } from '../src/lib/services/serviceDescriptionCache';
import { defaultEndpoint } from '../src/lib/stores/endpointStore';

/**
 * Storybook preview configuration for SQUI
 * Integrates Carbon Design System and provides theme switching
 */

/**
 * Graph completion mock decorator - sets up service description for graph completion stories
 * This ensures the mock data is available BEFORE the CodeMirror editor initializes
 */
const withGraphCompletionMocks: Decorator = (story, context) => {
  // Check if this is a graph completion story
  const storyId = (context.id || '').toLowerCase();
  const storyName = (context.name || '').toLowerCase();
  const title = (context.title || '').toLowerCase();
  const isGraphCompletionStory = storyId.includes('graph') && storyId.includes('completion') ||
                                  storyName.includes('graph') && storyName.includes('completion') ||
                                  title.includes('sparqleditor') && storyName.includes('graph');

  if (isGraphCompletionStory && typeof window !== 'undefined') {
    const mockEndpoint = 'http://example.org/sparql';

    // Determine which mock data to use based on story name
    let mockServiceDesc: ServiceDescription;

    if (storyId.includes('from-named')) {
      // Mock for FROM NAMED story - only named graphs
      mockServiceDesc = {
        endpoint: mockEndpoint,
        supportedLanguages: [],
        features: [],
        resultFormats: ['application/sparql-results+json'],
        inputFormats: [],
        extensionFunctions: [],
        extensionAggregates: [],
        datasets: [
          {
            defaultGraphs: [
              {
                uri: 'http://example.org/default-graph',
                metadata: { triples: 5000 },
              },
            ],
            namedGraphs: [
              {
                name: 'http://example.org/graph/people',
                entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
                metadata: { triples: 8420 },
              },
              {
                name: 'http://example.org/graph/places',
                metadata: { triples: 3156 },
              },
              {
                name: 'http://example.org/graph/events',
                entailmentRegime: 'http://www.w3.org/ns/entailment/OWL-DL',
                metadata: { triples: 12089 },
              },
            ],
          },
        ],
        lastFetched: new Date(),
        available: true,
      };
    } else if (storyId.includes('filtered')) {
      // Mock for filtered completion story
      mockServiceDesc = {
        endpoint: mockEndpoint,
        supportedLanguages: [],
        features: [],
        resultFormats: ['application/sparql-results+json'],
        inputFormats: [],
        extensionFunctions: [],
        extensionAggregates: [],
        datasets: [
          {
            defaultGraphs: [],
            namedGraphs: [
              {
                name: 'http://example.org/graph/people',
                metadata: { triples: 8420 },
              },
              {
                name: 'http://example.org/graph/places',
                metadata: { triples: 3156 },
              },
              {
                name: 'http://example.org/graph/products',
                metadata: { triples: 15230 },
              },
              {
                name: 'http://example.org/graph/events',
                metadata: { triples: 12089 },
              },
            ],
          },
        ],
        lastFetched: new Date(),
        available: true,
      };
    } else {
      // Default mock for FROM story - includes both default and named graphs
      mockServiceDesc = {
        endpoint: mockEndpoint,
        supportedLanguages: [],
        features: [],
        resultFormats: ['application/sparql-results+json'],
        inputFormats: [],
        extensionFunctions: [],
        extensionAggregates: [],
        datasets: [
          {
            defaultGraphs: [
              {
                uri: 'http://example.org/default-graph',
                metadata: { triples: 5000 },
              },
            ],
            namedGraphs: [
              {
                name: 'http://example.org/products',
                entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
                metadata: { triples: 10245 },
              },
              {
                name: 'http://example.org/customers',
                metadata: { triples: 523 },
              },
              {
                name: 'http://example.org/orders',
                entailmentRegime: 'http://www.w3.org/ns/entailment/OWL-DL',
                metadata: { triples: 1024332 },
              },
            ],
          },
        ],
        lastFetched: new Date(),
        available: true,
      };
    }

    // Set up the cache and store BEFORE rendering
    // 1. Set cache so fetchForEndpoint can find it
    serviceDescriptionCache.set(mockEndpoint, mockServiceDesc);

    // 2. Load from cache into store (this is synchronous when cached)
    serviceDescriptionStore.fetchForEndpoint(mockEndpoint);

    // 3. Set the default endpoint
    defaultEndpoint.set(mockEndpoint);
  }

  return story();
};

/**
 * Store initialization decorator - ensures all stores are properly initialized
 * This prevents "Cannot convert undefined or null to object" errors
 */
const withStoreInit: Decorator = (story, context) => {
  // Reset stores to initial state before each story
  if (typeof window !== 'undefined') {
    try {
      resultsStore.reset();
      queryStore.reset();
    } catch (err) {
      console.warn('Failed to reset stores:', err);
    }
  }

  return story();
};

/**
 * Theme decorator - applies Carbon theme classes to Storybook preview
 * This makes Carbon CSS variables available to all components
 */
const withTheme: Decorator = (story, context) => {
  const theme = (context.globals.theme as CarbonTheme) || 'white';

  // Apply theme to the preview body and update theme store
  if (typeof document !== 'undefined') {
    const body = document.body;

    // Remove all theme classes
    body.classList.remove('white', 'g10', 'g90', 'g100');

    // Add the current theme class
    body.classList.add(theme);

    // Apply to the main Storybook preview container
    const previewBody = document.querySelector('.sb-show-main');
    if (previewBody) {
      previewBody.classList.remove('white', 'g10', 'g90', 'g100');
      previewBody.classList.add(theme);
    }

    // Also apply to the docs root for Docs view
    const docsRoot = document.querySelector('.docs-story');
    if (docsRoot) {
      docsRoot.classList.remove('white', 'g10', 'g90', 'g100');
      docsRoot.classList.add(theme);
    }

    // Sync with our theme store (dynamic import to avoid SSR issues)
    import('../src/lib/stores/theme').then(({ themeStore }) => {
      themeStore.setTheme(theme);
    });
  }

  return story();
};

const preview: Preview = {
  parameters: {
    // Configure controls for automatic arg type inference
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    // Accessibility addon configuration
    a11y: {
      config: {
        rules: [
          {
            // Disable color-contrast rule for now (Carbon handles this)
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
    // Backgrounds configuration synchronized with themes
    backgrounds: {
      default: 'white',
      values: [
        {
          name: 'white',
          value: '#ffffff',
        },
        {
          name: 'g10',
          value: '#f4f4f4',
        },
        {
          name: 'g90',
          value: '#262626',
        },
        {
          name: 'g100',
          value: '#161616',
        },
      ],
    },
    // Docs configuration
    docs: {
      toc: true,
    },
  },
  // Apply decorators - graph completion mocks first (before component renders), then store init, then theme
  decorators: [withGraphCompletionMocks, withStoreInit, withTheme],
  // Global types for toolbar controls
  globalTypes: {
    theme: {
      name: 'Carbon Theme',
      description: 'Carbon Design System theme',
      defaultValue: 'white',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'white', title: 'White (Light)', left: '🌞' },
          { value: 'g10', title: 'Gray 10 (Light)', left: '☀️' },
          { value: 'g90', title: 'Gray 90 (Dark)', left: '🌙' },
          { value: 'g100', title: 'Gray 100 (Dark)', left: '🌑' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;