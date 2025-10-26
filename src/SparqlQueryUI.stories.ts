import type { Meta, StoryObj } from '@storybook/sveltekit';
import type { SquiConfig } from './lib/types';
import SparqlQueryUI from './SparqlQueryUI.svelte';

/**
 * The main SPARQL Query UI component. A complete interface for composing, executing,
 * and visualizing SPARQL queries against any SPARQL endpoint.
 * Built with Svelte 5 and Carbon Design System.
 */
const meta = {
  title: 'SQUI/SparqlQueryUI',
  component: SparqlQueryUI,
  tags: ['autodocs'],
  argTypes: {
    endpoint: {
      control: 'object',
      description: 'SPARQL endpoint configuration with URL and optional selector visibility',
      table: {
        type: { summary: 'EndpointConfig' },
      },
    },
    theme: {
      control: 'object',
      description: 'Carbon Design System theme configuration',
      table: {
        type: { summary: 'ThemeConfig' },
      },
    },
    limits: {
      control: 'object',
      description: 'Query execution limits (maxRows, chunkSize, timeout)',
      table: {
        type: { summary: 'LimitsConfig' },
      },
    },
    features: {
      control: 'object',
      description: 'Feature flags for enabling/disabling functionality',
      table: {
        type: { summary: 'FeaturesConfig' },
      },
    },
    prefixes: {
      control: 'object',
      description: 'Default SPARQL prefixes configuration',
      table: {
        type: { summary: 'PrefixConfig' },
      },
    },
    localization: {
      control: 'object',
      description: 'Localization and internationalization settings',
      table: {
        type: { summary: 'LocalizationConfig' },
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete SPARQL query interface with editor, results visualization, and endpoint management. Configurable theme, features, and limits.',
      },
    },
  },
} satisfies Meta<SquiConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default configuration with no endpoint specified.
 * Shows the basic component structure.
 */
export const Default: Story = {
  args: {},
};

/**
 * Configured with DBpedia endpoint.
 * DBpedia is a crowd-sourced community effort to extract structured content from Wikipedia.
 */
export const DBpediaEndpoint: Story = {
  args: {
    endpoint: {
      url: 'https://dbpedia.org/sparql',
      hideSelector: false,
    },
  },
};

/**
 * Configured with Wikidata Query Service endpoint.
 * Wikidata provides structured data for Wikimedia projects.
 */
export const WikidataEndpoint: Story = {
  args: {
    endpoint: {
      url: 'https://query.wikidata.org/sparql',
      hideSelector: false,
    },
    prefixes: {
      default: {
        wd: 'http://www.wikidata.org/entity/',
        wdt: 'http://www.wikidata.org/prop/direct/',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      },
    },
  },
};

/**
 * White theme (default) - light theme with high contrast.
 */
export const WhiteTheme: Story = {
  args: {
    theme: { theme: 'white' },
    endpoint: { url: 'https://dbpedia.org/sparql' },
  },
  parameters: {
    backgrounds: { default: 'white' },
  },
};

/**
 * Gray 10 theme - light theme with slightly darker background.
 */
export const G10Theme: Story = {
  args: {
    theme: { theme: 'g10' },
    endpoint: { url: 'https://dbpedia.org/sparql' },
  },
  parameters: {
    backgrounds: { default: 'g10' },
  },
};

/**
 * Gray 90 dark theme - dark interface with light text.
 */
export const G90DarkTheme: Story = {
  args: {
    theme: { theme: 'g90' },
    endpoint: { url: 'https://dbpedia.org/sparql' },
  },
  parameters: {
    backgrounds: { default: 'g90' },
  },
};

/**
 * Gray 100 darkest theme - maximum contrast dark interface.
 */
export const G100DarkestTheme: Story = {
  args: {
    theme: { theme: 'g100' },
    endpoint: { url: 'https://dbpedia.org/sparql' },
  },
  parameters: {
    backgrounds: { default: 'g100' },
  },
};

/**
 * Custom limits configuration for result handling.
 * Lower limits for better performance with large datasets.
 */
export const CustomLimits: Story = {
  args: {
    endpoint: { url: 'https://dbpedia.org/sparql' },
    limits: {
      maxRows: 50000,
      chunkSize: 500,
      timeout: 60000,
    },
  },
};

/**
 * All optional features enabled.
 * Shows full functionality including tabs, filters, downloads, sharing, and history.
 */
export const AllFeaturesEnabled: Story = {
  args: {
    endpoint: { url: 'https://dbpedia.org/sparql' },
    features: {
      enableTabs: true,
      enableFilters: true,
      enableDownloads: true,
      enableSharing: true,
      enableHistory: true,
    },
  },
};

/**
 * Minimal features configuration.
 * Basic query interface without advanced features.
 */
export const MinimalFeatures: Story = {
  args: {
    endpoint: { url: 'https://dbpedia.org/sparql' },
    features: {
      enableTabs: false,
      enableFilters: false,
      enableDownloads: false,
      enableSharing: false,
      enableHistory: false,
    },
  },
};

/**
 * Fixed endpoint configuration with hidden selector.
 * Useful when embedding in an application with predetermined endpoint.
 */
export const FixedEndpoint: Story = {
  args: {
    endpoint: {
      url: 'https://dbpedia.org/sparql',
      hideSelector: true,
    },
  },
};

/**
 * Full configuration example with all options specified.
 * Production-ready setup with Wikidata endpoint, common prefixes, and balanced settings.
 */
export const FullConfiguration: Story = {
  args: {
    endpoint: {
      url: 'https://query.wikidata.org/sparql',
      hideSelector: false,
    },
    prefixes: {
      default: {
        wd: 'http://www.wikidata.org/entity/',
        wdt: 'http://www.wikidata.org/prop/direct/',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        schema: 'http://schema.org/',
      },
    },
    theme: { theme: 'g10' },
    localization: { locale: 'en' },
    features: {
      enableTabs: true,
      enableFilters: true,
      enableDownloads: true,
      enableSharing: false,
      enableHistory: true,
    },
    limits: {
      maxRows: 100000,
      chunkSize: 1000,
      timeout: 30000,
    },
  },
  parameters: {
    backgrounds: { default: 'g10' },
  },
};
