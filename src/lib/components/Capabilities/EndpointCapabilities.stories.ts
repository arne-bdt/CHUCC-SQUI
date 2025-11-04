/**
 * Storybook stories for EndpointCapabilities component
 *
 * Note: These stories show the component structure but cannot fully demonstrate
 * store-driven functionality in Storybook. For full testing, see:
 * - E2E tests: tests/e2e/endpoint-capabilities.storybook.spec.ts
 * - Integration tests for sub-components: tests/integration/LanguageSupport.test.ts, etc.
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointCapabilities from './EndpointCapabilities.svelte';

const meta = {
  title: 'Components/Capabilities/EndpointCapabilities',
  component: EndpointCapabilities,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
EndpointCapabilities displays SPARQL endpoint capabilities based on Service Description metadata.

**Note**: This component is store-dependent and cannot be fully demonstrated in Storybook stories.
For interactive testing:
- Use manual Storybook preview with dev server
- Run E2E tests that navigate to actual Storybook stories
- Test sub-components individually (LanguageSupport, FeatureList, etc.)

The component reads from \`serviceDescriptionStore\` and displays:
- Supported SPARQL versions
- Service features
- Result/input formats
- Extension functions and aggregates
- Dataset information
        `,
      },
    },
  },
} satisfies Meta<EndpointCapabilities>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story showing the component structure.
 * In a real application, this would be populated by the serviceDescriptionStore.
 */
export const Default: Story = {
  args: {
    endpointUrl: 'https://dbpedia.org/sparql',
  },
};

/**
 * Component without an endpoint URL.
 * Should show "Service description not available" message.
 */
export const NoEndpoint: Story = {
  args: {},
};

/**
 * For manual testing in development:
 * 1. Start the dev server: `npm run dev`
 * 2. Navigate to a page that populates the serviceDescriptionStore
 * 3. View this story to see actual data
 */
export const ManualTest: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story is for manual testing with a running application.
The component will show actual data from the serviceDescriptionStore
if it has been populated by the application.
        `,
      },
    },
  },
};
