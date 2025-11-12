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
  args: {
    instanceId: 'story-default',
    disablePersistence: true,
  },
};

/**
 * Configured with DBpedia endpoint.
 * DBpedia is a crowd-sourced community effort to extract structured content from Wikipedia.
 */
export const DBpediaEndpoint: Story = {
  args: {
    instanceId: 'story-dbpedia',
    disablePersistence: true,
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
    instanceId: 'story-wikidata',
    disablePersistence: true,
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
 * Custom limits configuration for result handling.
 * Lower limits for better performance with large datasets.
 */
export const CustomLimits: Story = {
  args: {
    instanceId: 'story-custom-limits',
    disablePersistence: true,
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
    instanceId: 'story-all-features',
    disablePersistence: true,
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
    instanceId: 'story-minimal',
    disablePersistence: true,
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
    instanceId: 'story-fixed',
    disablePersistence: true,
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
    instanceId: 'story-full',
    disablePersistence: true,
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
  globals: {
    backgrounds: {
      value: "g10"
    }
  },
};

/**
 * Responsive Grid Layout Demonstration (Task 63)
 * Showcases Carbon 2x Grid system with responsive behavior:
 * - Large screens (≥1056px): 16 columns with 32px side padding
 * - Medium screens (672px-1055px): 8 columns with 16px side padding
 * - Small screens (<672px): 4 columns with 16px side padding
 *
 * Use Storybook's viewport toolbar to test different screen sizes:
 * - Mobile (375px) - 4 columns
 * - Tablet (768px) - 8 columns
 * - Desktop (1024px, 1440px, 1920px) - 16 columns
 */
export const ResponsiveGridLayout: Story = {
  args: {
    instanceId: 'story-grid',
    disablePersistence: true,
    endpoint: {
      url: 'https://dbpedia.org/sparql',
      hideSelector: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates Carbon 2x Grid system with responsive column layout (16/8/4) and consistent side padding. Resize the viewport or use the viewport toolbar to see how the layout adapts at different breakpoints.',
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
        },
        wide: {
          name: 'Wide Desktop',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },
  },
};
