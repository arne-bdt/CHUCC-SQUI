import type { Meta, StoryObj } from '@storybook/svelte';
import StoreProviderDemo from './StoreProvider.demo.svelte';

const meta = {
  title: 'Components/StoreProvider',
  component: StoreProviderDemo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The **StoreProvider** component creates fresh instances of all application stores and provides them via Svelte context to child components.

This ensures state isolation between:
- Storybook stories
- Multiple tabs
- Multiple component instances

## Benefits

- **State Isolation**: Each component tree gets independent state
- **Testability**: Easy to provide mock stores in tests
- **Reusability**: Same component can be used multiple times
- **Storybook**: Stories don't leak state to each other

## Usage

\`\`\`svelte
<StoreProvider initialQuery="SELECT * WHERE { ?s ?p ?o }" initialEndpoint="https://dbpedia.org/sparql">
  <YourComponent />
</StoreProvider>
\`\`\`

Child components access stores using context utilities:

\`\`\`typescript
import { getQueryStore, getResultsStore, getUIStore, getEndpointStore } from '$lib/stores';

const queryStore = getQueryStore(); // Gets context store or falls back to global
const state = $derived($queryStore);
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<StoreProviderDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story showing StoreProvider with initial values
 */
export const Default: Story = {
  args: {
    initialQuery: '',
    initialEndpoint: '',
    showMultiple: false,
  },
};

/**
 * StoreProvider with initial query text
 */
export const WithInitialQuery: Story = {
  args: {
    initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
    initialEndpoint: '',
    showMultiple: false,
  },
};

/**
 * StoreProvider with initial endpoint
 */
export const WithInitialEndpoint: Story = {
  args: {
    initialQuery: '',
    initialEndpoint: 'https://dbpedia.org/sparql',
    showMultiple: false,
  },
};

/**
 * StoreProvider with both initial query and endpoint
 */
export const WithInitialValues: Story = {
  args: {
    initialQuery: 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nSELECT * WHERE { ?s rdf:type ?o }',
    initialEndpoint: 'https://query.wikidata.org/sparql',
    showMultiple: false,
  },
};

/**
 * Multiple isolated instances
 * Demonstrates that each StoreProvider creates independent state
 */
export const MultipleInstances: Story = {
  args: {
    initialQuery: '',
    initialEndpoint: '',
    showMultiple: true,
  },
};
