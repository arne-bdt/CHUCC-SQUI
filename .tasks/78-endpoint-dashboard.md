# Task 78: Create Endpoint Dashboard Component

## Overview

Create a tabbed dashboard component that displays comprehensive endpoint information including capabilities, datasets, and extension functions. This component is used within the expanded state of EndpointInfoSummary.

## Motivation

### User Experience Goals

1. **Comprehensive View**: All endpoint information in one organized interface
2. **Efficient Navigation**: Tabs allow quick switching between information types
3. **Reusable Component**: Can be used in multiple contexts (summary, modal, sidebar)
4. **Professional Design**: Matches modern SPARQL tools (YASGUI, Virtuoso)

### Current Limitations

- EndpointCapabilities component is designed for a separate panel
- No integrated view combining all endpoint information
- Users must navigate to different sections to see capabilities

## Requirements

### Component API

**File**: `src/lib/components/Endpoint/EndpointDashboard.svelte`

```typescript
interface Props {
  /** SPARQL endpoint URL */
  endpointUrl: string;

  /** Initial tab to display */
  initialTab?: 'capabilities' | 'datasets' | 'functions';

  /** Callback when function is inserted into editor */
  onInsertFunction?: (functionCall: string) => void;

  /** Compact mode for smaller displays */
  compact?: boolean;
}
```

### UI/UX Design

```
┌──────────────────────────────────────────────────────────┐
│ [Capabilities] [Datasets] [Functions]                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Capabilities Tab:                                        │
│ • SPARQL Support: SPARQL 1.1 Query, SPARQL 1.1 Update   │
│ • Features: Basic Federated Query                        │
│ • Result Formats: JSON, XML, CSV, TSV                    │
│                                                           │
│ Datasets Tab:                                            │
│ • 3 Named Graphs                                         │
│ • List of graph URIs with triple counts                 │
│                                                           │
│ Functions Tab:                                           │
│ • Search extension functions                             │
│ • Grouped by category                                    │
│ • Insert button for each function                        │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Features

1. **Tab Navigation**:
   - Capabilities tab: Language support, features, formats
   - Datasets tab: Graph information, triple counts
   - Functions tab: Extension functions and aggregates

2. **Capabilities Tab**:
   - Reuse LanguageSupport component
   - Reuse FeatureList component
   - Reuse FormatList component
   - Show input and result formats side by side

3. **Datasets Tab**:
   - Reuse DatasetInfo component
   - Show summary statistics at top
   - Expandable graph lists

4. **Functions Tab**:
   - Reuse FunctionLibrary component
   - Search and filter functionality
   - Insert function into editor

5. **Responsive Behavior**:
   - Tabs stack on mobile
   - Content adapts to container width
   - Compact mode reduces padding

## Implementation Details

### Component Structure

```svelte
<script lang="ts">
  import { Tabs, Tab, TabContent } from 'carbon-components-svelte';
  import { getServiceDescriptionStore } from '../../stores/storeContext';
  import LanguageSupport from '../Capabilities/LanguageSupport.svelte';
  import FeatureList from '../Capabilities/FeatureList.svelte';
  import FormatList from '../Capabilities/FormatList.svelte';
  import DatasetInfo from '../Capabilities/DatasetInfo.svelte';
  import FunctionLibrary from '../Functions/FunctionLibrary.svelte';

  interface Props {
    endpointUrl: string;
    initialTab?: 'capabilities' | 'datasets' | 'functions';
    onInsertFunction?: (functionCall: string) => void;
    compact?: boolean;
  }

  let {
    endpointUrl,
    initialTab = 'capabilities',
    onInsertFunction,
    compact = false,
  }: Props = $props();

  const serviceDescriptionStore = getServiceDescriptionStore();
  const state = $derived($serviceDescriptionStore);

  // Get service description for endpoint
  const serviceDesc = $derived.by(() => {
    return state.descriptions.get(endpointUrl);
  });

  // Selected tab index (0 = capabilities, 1 = datasets, 2 = functions)
  let selectedTab = $state(getInitialTabIndex(initialTab));

  function getInitialTabIndex(tab: string): number {
    switch (tab) {
      case 'capabilities': return 0;
      case 'datasets': return 1;
      case 'functions': return 2;
      default: return 0;
    }
  }

  // Check if tabs should be displayed
  const hasDatasets = $derived(
    serviceDesc?.datasets && serviceDesc.datasets.length > 0
  );

  const hasFunctions = $derived(
    serviceDesc &&
    (serviceDesc.extensionFunctions.length > 0 ||
     serviceDesc.extensionAggregates.length > 0)
  );
</script>

<div class="endpoint-dashboard" class:compact>
  {#if !serviceDesc || !serviceDesc.available}
    <div class="empty-state">
      <p>No endpoint information available</p>
    </div>
  {:else}
    <Tabs bind:selected={selectedTab}>
      <!-- Capabilities Tab -->
      <Tab label="Capabilities">
        <TabContent>
          <div class="tab-section">
            <h5 class="section-title">SPARQL Support</h5>
            <LanguageSupport languages={serviceDesc.supportedLanguages} />
          </div>

          {#if serviceDesc.features.length > 0}
            <div class="tab-section">
              <h5 class="section-title">Features</h5>
              <FeatureList features={serviceDesc.features} />
            </div>
          {/if}

          <div class="tab-section">
            <h5 class="section-title">Result Formats</h5>
            <FormatList formats={serviceDesc.resultFormats} />
          </div>

          {#if serviceDesc.inputFormats.length > 0}
            <div class="tab-section">
              <h5 class="section-title">Input Formats</h5>
              <FormatList formats={serviceDesc.inputFormats} />
            </div>
          {/if}
        </TabContent>
      </Tab>

      <!-- Datasets Tab -->
      {#if hasDatasets}
        <Tab label="Datasets">
          <TabContent>
            <div class="tab-section">
              <DatasetInfo datasets={serviceDesc.datasets} />
            </div>
          </TabContent>
        </Tab>
      {/if}

      <!-- Functions Tab -->
      {#if hasFunctions}
        <Tab label="Functions">
          <TabContent>
            <div class="tab-section">
              <FunctionLibrary
                currentEndpoint={endpointUrl}
                {onInsertFunction}
              />
            </div>
          </TabContent>
        </Tab>
      {/if}
    </Tabs>
  {/if}
</div>

<style>
  .endpoint-dashboard {
    width: 100%;
    min-height: 200px;
  }

  .compact {
    font-size: var(--cds-body-compact-01);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    color: var(--cds-text-secondary);
    font-style: italic;
  }

  .tab-section {
    padding: var(--cds-spacing-05) 0;
  }

  .compact .tab-section {
    padding: var(--cds-spacing-04) 0;
  }

  .tab-section:not(:last-child) {
    border-bottom: 1px solid var(--cds-border-subtle-01);
  }

  .section-title {
    font-size: var(--cds-body-compact-01);
    font-weight: 600;
    line-height: 1.43;
    color: var(--cds-text-primary);
    margin: 0 0 var(--cds-spacing-04) 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .compact .section-title {
    font-size: var(--cds-label-01);
    margin-bottom: var(--cds-spacing-03);
  }

  /* Override Carbon Tabs styling for compact mode */
  .compact :global(.bx--tabs) {
    min-height: 32px;
  }

  .compact :global(.bx--tabs__nav-item) {
    padding: var(--cds-spacing-03) var(--cds-spacing-04);
  }

  .compact :global(.bx--tab-content) {
    padding: var(--cds-spacing-04);
  }
</style>
```

### Key Behaviors

1. **Dynamic Tabs**:
   - Only show Datasets tab if datasets exist
   - Only show Functions tab if extension functions/aggregates exist
   - Always show Capabilities tab

2. **Tab Persistence**:
   - Remember selected tab across re-renders
   - Support initialTab prop for default selection

3. **Component Reuse**:
   - Leverage existing components (LanguageSupport, FeatureList, etc.)
   - No duplication of rendering logic

4. **Compact Mode**:
   - Reduced padding and font sizes
   - Useful for embedding in sidebars or modals

## Implementation Steps

### Step 1: Create Component File
1. Create `src/lib/components/Endpoint/EndpointDashboard.svelte`
2. Implement tab structure with Carbon Tabs component
3. Import and integrate existing capability components
4. Add conditional rendering for datasets and functions tabs

### Step 2: Implement Tab Logic
1. Map initialTab prop to tab index
2. Implement two-way binding for selected tab
3. Add dynamic tab visibility based on available data

### Step 3: Styling
1. Use Carbon Design System tokens
2. Implement compact mode styles
3. Ensure consistent spacing between sections
4. Test responsive behavior

### Step 4: Integration with Existing Components
1. Pass correct props to LanguageSupport, FeatureList, etc.
2. Handle onInsertFunction callback for FunctionLibrary
3. Ensure all components work within tab context

### Step 5: Create Storybook Stories
**File**: `src/lib/components/Endpoint/EndpointDashboard.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointDashboard from './EndpointDashboard.svelte';
import { getServiceDescriptionStore } from '../../stores/storeContext';

const meta = {
  title: 'Components/Endpoint/EndpointDashboard',
  component: EndpointDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<EndpointDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

const fullServiceDescription = {
  endpoint: 'http://dbpedia.org/sparql',
  supportedLanguages: [
    'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',
    'http://www.w3.org/ns/sparql-service-description#SPARQL11Update',
  ],
  features: [
    'http://www.w3.org/ns/sparql-service-description#BasicFederatedQuery',
  ],
  resultFormats: [
    'application/sparql-results+json',
    'application/sparql-results+xml',
    'text/csv',
    'text/tab-separated-values',
  ],
  inputFormats: [
    'application/rdf+xml',
    'text/turtle',
  ],
  extensionFunctions: [
    { uri: 'http://example.org/fn/dateFormat', label: 'dateFormat', comment: 'Format dates' },
    { uri: 'http://example.org/fn/substring', label: 'substring', comment: 'Extract substring' },
  ],
  extensionAggregates: [
    { uri: 'http://example.org/agg/median', label: 'median', comment: 'Calculate median' },
  ],
  datasets: [
    {
      namedGraphs: [
        {
          name: 'http://dbpedia.org/graph/ontology',
          metadata: { 'http://rdfs.org/ns/void#triples': 45678 },
        },
        {
          name: 'http://dbpedia.org/graph/en',
          metadata: { 'http://rdfs.org/ns/void#triples': 1234567 },
        },
      ],
      defaultGraphs: [],
    },
  ],
  lastFetched: new Date(),
  available: true,
};

export const Default: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    initialTab: 'capabilities',
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', fullServiceDescription],
      ]),
    }));
  },
};

export const DatasetsTab: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    initialTab: 'datasets',
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', fullServiceDescription],
      ]),
    }));
  },
};

export const FunctionsTab: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    initialTab: 'functions',
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', fullServiceDescription],
      ]),
    }));
  },
};

export const CompactMode: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    initialTab: 'capabilities',
    compact: true,
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', fullServiceDescription],
      ]),
    }));
  },
};

export const MinimalData: Story = {
  args: {
    endpointUrl: 'http://example.org/sparql',
    initialTab: 'capabilities',
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://example.org/sparql', {
          endpoint: 'http://example.org/sparql',
          supportedLanguages: [
            'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',
          ],
          features: [],
          resultFormats: ['application/sparql-results+json'],
          inputFormats: [],
          extensionFunctions: [],
          extensionAggregates: [],
          datasets: [],
          lastFetched: new Date(),
          available: true,
        }],
      ]),
    }));
  },
};

export const NoServiceDescription: Story = {
  args: {
    endpointUrl: 'http://unavailable.org/sparql',
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://unavailable.org/sparql', {
          endpoint: 'http://unavailable.org/sparql',
          supportedLanguages: [],
          features: [],
          resultFormats: [],
          inputFormats: [],
          extensionFunctions: [],
          extensionAggregates: [],
          datasets: [],
          lastFetched: new Date(),
          available: false,
        }],
      ]),
    }));
  },
};
```

### Step 6: Create Unit Tests
**File**: `tests/unit/components/Endpoint/EndpointDashboard.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EndpointDashboard from '$lib/components/Endpoint/EndpointDashboard.svelte';

describe('EndpointDashboard', () => {
  const mockServiceDescription = {
    endpoint: 'http://dbpedia.org/sparql',
    supportedLanguages: [
      'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',
    ],
    features: [],
    resultFormats: ['application/sparql-results+json'],
    inputFormats: [],
    extensionFunctions: [
      { uri: 'http://example.org/fn/test', label: 'test', comment: 'Test function' },
    ],
    extensionAggregates: [],
    datasets: [
      {
        namedGraphs: [{ name: 'http://example.org/graph1' }],
        defaultGraphs: [],
      },
    ],
    lastFetched: new Date(),
    available: true,
  };

  it('renders capabilities tab by default', async () => {
    render(EndpointDashboard, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('SPARQL Support')).toBeInTheDocument();
    });
  });

  it('shows all tabs when data is available', async () => {
    render(EndpointDashboard, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Capabilities/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Datasets/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Functions/ })).toBeInTheDocument();
    });
  });

  it('hides datasets tab when no datasets', async () => {
    render(EndpointDashboard, {
      props: {
        endpointUrl: 'http://example.org/sparql',
      },
    });

    // Assuming store is set up with no datasets
    await waitFor(() => {
      expect(screen.queryByRole('tab', { name: /Datasets/ })).not.toBeInTheDocument();
    });
  });

  it('switches to datasets tab when initialTab is "datasets"', async () => {
    render(EndpointDashboard, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
        initialTab: 'datasets',
      },
    });

    await waitFor(() => {
      const datasetsTab = screen.getByRole('tab', { name: /Datasets/ });
      expect(datasetsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('applies compact styles when compact prop is true', () => {
    const { container } = render(EndpointDashboard, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
        compact: true,
      },
    });

    expect(container.querySelector('.endpoint-dashboard')).toHaveClass('compact');
  });

  it('shows empty state when service description unavailable', async () => {
    render(EndpointDashboard, {
      props: {
        endpointUrl: 'http://unavailable.org/sparql',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No endpoint information available')).toBeInTheDocument();
    });
  });

  it('calls onInsertFunction when function is inserted', async () => {
    const user = userEvent.setup();
    const onInsertFunction = vi.fn();

    render(EndpointDashboard, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
        initialTab: 'functions',
        onInsertFunction,
      },
    });

    // Switch to functions tab
    const functionsTab = await screen.findByRole('tab', { name: /Functions/ });
    await user.click(functionsTab);

    // Find and click insert button (implementation depends on FunctionLibrary)
    // This is a placeholder - actual test would interact with FunctionLibrary
  });
});
```

### Step 7: Run Tests and Build
```bash
npm test                    # Unit tests must pass
npm run build               # Build must succeed
npm run lint                # No linting errors
npm run type-check          # No type errors
npm run storybook           # Manual visual verification
```

## Acceptance Criteria

### Component Functionality
- ✅ Renders all tabs when data available
- ✅ Hides datasets tab when no datasets
- ✅ Hides functions tab when no extension functions
- ✅ Respects initialTab prop
- ✅ Switches tabs on click
- ✅ Shows empty state when unavailable
- ✅ Applies compact mode styles
- ✅ Passes onInsertFunction to FunctionLibrary
- ✅ Reuses existing components correctly

### Storybook Stories
- ✅ Default story shows capabilities tab
- ✅ Datasets tab story shows datasets
- ✅ Functions tab story shows functions
- ✅ Compact mode story shows reduced padding
- ✅ Minimal data story hides empty tabs
- ✅ No service description story shows empty state
- ✅ All stories render without errors

### Unit Tests
- ✅ All tests pass
- ✅ Coverage >80%
- ✅ Tests verify tab rendering
- ✅ Tests verify tab switching
- ✅ Tests verify compact mode
- ✅ Tests verify empty state

### Build & Quality Checks
```bash
npm run build               # ✅ 0 errors, 0 warnings
npm test                    # ✅ All tests pass
npm run lint                # ✅ No violations
npm run type-check          # ✅ No type errors
```

## Dependencies

**Prerequisite Tasks:**
- Task 77: Create EndpointInfoSummary component

**Existing Components (reused):**
- LanguageSupport.svelte
- FeatureList.svelte
- FormatList.svelte
- DatasetInfo.svelte
- FunctionLibrary.svelte

**Next Tasks:**
- Task 78: Integrate EndpointDashboard with main query interface

## Troubleshooting

### Common Issues

**Issue**: Tabs component not rendering correctly
**Solution**: Check Carbon Svelte Tabs import and usage

**Issue**: Child components not receiving data
**Solution**: Verify service description structure matches expected types

**Issue**: Tab selection not persisting
**Solution**: Ensure two-way binding with bind:selected

**Issue**: Compact mode not applying
**Solution**: Check CSS class application and specificity

## Future Enhancements

- **Tab Badges**: Show counts on tab labels (e.g., "Datasets (3)")
- **Deep Linking**: Support URL parameters for tab selection
- **Export**: Export endpoint information as JSON/RDF
- **Compare**: Compare capabilities of multiple endpoints
- **Print**: Print-friendly layout

## References

- **Carbon Tabs**: https://svelte.carbondesignsystem.com/components/Tabs
- **Existing Components**: `src/lib/components/Capabilities/`
- **Service Description**: `src/lib/types/serviceDescription.ts`

---

**Previous Task**: [Task 77: Create EndpointInfoSummary Component](./76-endpoint-info-summary.md)
**Next Task**: [Task 78: Integrate with Main Query Interface](./79-integrate-endpoint-dashboard.md)
