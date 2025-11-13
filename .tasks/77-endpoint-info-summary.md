# Task 79: Create Endpoint Info Summary Component

## Overview

Create a collapsible summary component that displays key endpoint information at a glance. This component shows a concise summary when collapsed and can expand to show detailed capabilities.

## Motivation

### User Experience Goals

1. **Quick Info Access**: Users can see endpoint capabilities without opening a separate panel
2. **Contextual Awareness**: Understanding endpoint features helps users write better queries
3. **Professional Interface**: Matches the quality of tools like YASGUI
4. **Efficient Space Usage**: Collapsible design saves screen real estate

### Current Limitations

- Endpoint capabilities are hidden in a separate Capabilities panel
- Users don't know what features an endpoint supports before writing queries
- No quick way to see dataset information (graphs, triple counts)
- Extension functions are not immediately discoverable

## Requirements

### Component API

**File**: `src/lib/components/Endpoint/EndpointInfoSummary.svelte`

```typescript
interface Props {
  /** SPARQL endpoint URL */
  endpointUrl: string;

  /** Whether the summary is expanded */
  expanded?: boolean;

  /** Callback when expansion state changes */
  onToggle?: (expanded: boolean) => void;

  /** Whether to show refresh button */
  showRefresh?: boolean;

  /** Whether component is disabled */
  disabled?: boolean;
}
```

### UI/UX Design

**Collapsed State** (default):
```
┌──────────────────────────────────────────────────────────┐
│ [▶] Endpoint Info: ✓ SPARQL 1.1 | 3 graphs | 12 functions | Last: 2m ago [↻] │
└──────────────────────────────────────────────────────────┘
```

**Expanded State**:
```
┌──────────────────────────────────────────────────────────┐
│ [▼] Endpoint Information                          [↻]    │
├──────────────────────────────────────────────────────────┤
│ 📊 Capabilities  │  📁 Datasets  │  🔧 Functions          │
├──────────────────────────────────────────────────────────┤
│ [Content from EndpointDashboard - see Task 77]          │
└──────────────────────────────────────────────────────────┘
```

### Features

1. **Collapsed Summary Line**:
   - SPARQL version support (e.g., "✓ SPARQL 1.1")
   - Number of graphs (e.g., "3 graphs")
   - Number of extension functions (e.g., "12 functions")
   - Last update timestamp (e.g., "Last: 2m ago")
   - Expand/collapse icon
   - Optional refresh button

2. **Expanded View**:
   - Tab interface for different sections
   - Capabilities tab (SPARQL support, features, formats)
   - Datasets tab (graphs, triple counts)
   - Functions tab (extension functions and aggregates)

3. **Loading States**:
   - Skeleton loader while fetching
   - Error state with retry button
   - Empty state when no service description available

4. **Responsive Behavior**:
   - Mobile: Vertical stacking
   - Desktop: Horizontal layout
   - Auto-hide non-essential info on narrow screens

## Implementation Details

### Component Structure

```svelte
<script lang="ts">
  import { ExpandableTile } from 'carbon-components-svelte';
  import { Renew, Checkmark, Information } from 'carbon-icons-svelte';
  import { getServiceDescriptionStore } from '../../stores/storeContext';
  import type { ServiceDescription } from '../../types';

  interface Props {
    endpointUrl: string;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    showRefresh?: boolean;
    disabled?: boolean;
  }

  let {
    endpointUrl,
    expanded = $bindable(false),
    onToggle,
    showRefresh = true,
    disabled = false,
  }: Props = $props();

  const serviceDescriptionStore = getServiceDescriptionStore();
  const state = $derived($serviceDescriptionStore);

  // Get service description for endpoint
  const serviceDesc = $derived.by(() => {
    return state.descriptions.get(endpointUrl);
  });

  // Summary statistics
  const summaryText = $derived.by(() => {
    if (!serviceDesc || !serviceDesc.available) {
      return 'No service description available';
    }

    const parts: string[] = [];

    // SPARQL version
    if (serviceDesc.supportedLanguages.includes('http://www.w3.org/ns/sparql-service-description#SPARQL11Query')) {
      parts.push('✓ SPARQL 1.1');
    }

    // Graph count
    const graphCount = serviceDesc.datasets.reduce(
      (sum, ds) => sum + ds.namedGraphs.length + ds.defaultGraphs.length,
      0
    );
    if (graphCount > 0) {
      parts.push(`${graphCount} graph${graphCount === 1 ? '' : 's'}`);
    }

    // Function count
    const funcCount = serviceDesc.extensionFunctions.length + serviceDesc.extensionAggregates.length;
    if (funcCount > 0) {
      parts.push(`${funcCount} function${funcCount === 1 ? '' : 's'}`);
    }

    // Last updated
    if (serviceDesc.lastFetched) {
      const age = getTimeAgo(serviceDesc.lastFetched);
      parts.push(`Last: ${age}`);
    }

    return parts.join(' | ');
  });

  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function handleRefresh() {
    if (endpointUrl) {
      serviceDescriptionStore.fetchForEndpoint(endpointUrl, true);
    }
  }

  function handleToggle() {
    expanded = !expanded;
    if (onToggle) {
      onToggle(expanded);
    }
  }
</script>

<div class="endpoint-info-summary" class:disabled>
  <ExpandableTile
    bind:expanded
    tileCollapsedIconText="Show endpoint information"
    tileExpandedIconText="Hide endpoint information"
    on:click={handleToggle}
  >
    <!-- Collapsed: Summary Line -->
    <div slot="above" class="summary-line">
      <Information size={16} class="info-icon" />
      <span class="summary-text">{summaryText}</span>
      {#if showRefresh && !state.loading}
        <button
          class="refresh-button"
          onclick={handleRefresh}
          aria-label="Refresh endpoint information"
        >
          <Renew size={16} />
        </button>
      {/if}
    </div>

    <!-- Expanded: Detailed View (handled by EndpointDashboard in Task 77) -->
    <div slot="below" class="expanded-content">
      <slot name="dashboard">
        <p class="placeholder">Dashboard content goes here (Task 77)</p>
      </slot>
    </div>
  </ExpandableTile>
</div>

<style>
  .endpoint-info-summary {
    width: 100%;
    margin: var(--cds-spacing-03) 0;
  }

  .summary-line {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03);
    font-size: var(--cds-body-compact-01);
    line-height: 1.43;
    color: var(--cds-text-secondary);
  }

  .info-icon {
    flex-shrink: 0;
  }

  .summary-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .refresh-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--cds-spacing-02);
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--cds-icon-secondary);
    transition: color 0.11s;
  }

  .refresh-button:hover {
    color: var(--cds-icon-primary);
  }

  .refresh-button:focus {
    outline: 2px solid var(--cds-focus);
    outline-offset: 2px;
  }

  .expanded-content {
    padding: var(--cds-spacing-05) 0;
  }

  .placeholder {
    color: var(--cds-text-secondary);
    font-style: italic;
  }

  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
```

### Key Behaviors

1. **Auto-fetch on mount**:
   - Component should trigger fetch if service description not cached
   - Use `serviceDescriptionStore.fetchForEndpoint(endpointUrl)`

2. **Loading state**:
   - Show skeleton text in summary while loading
   - Disable expand/collapse during loading

3. **Error handling**:
   - Show "No service description available" if unavailable
   - Still allow expansion to show error details
   - Provide retry button

4. **Accessibility**:
   - Keyboard navigation (Enter/Space to toggle)
   - ARIA labels for all interactive elements
   - Screen reader announcements for state changes

## Implementation Steps

### Step 1: Create Component File
1. Create `src/lib/components/Endpoint/EndpointInfoSummary.svelte`
2. Implement basic structure with ExpandableTile
3. Add summary line with icons and text
4. Add refresh button functionality

### Step 2: Implement Summary Logic
1. Calculate summary statistics from service description
2. Format time ago for last fetched
3. Handle loading, error, and empty states
4. Add responsive text truncation

### Step 3: Styling
1. Use Carbon Design System tokens
2. Ensure consistent spacing and alignment
3. Add hover/focus states for interactive elements
4. Test in light and dark themes

### Step 4: Auto-fetch Integration
1. Trigger fetch on mount if not cached
2. Subscribe to store updates
3. Handle concurrent fetches (debouncing)

### Step 5: Create Storybook Stories
**File**: `src/lib/components/Endpoint/EndpointInfoSummary.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointInfoSummary from './EndpointInfoSummary.svelte';
import { getServiceDescriptionStore } from '../../stores/storeContext';

const meta = {
  title: 'Components/Endpoint/EndpointInfoSummary',
  component: EndpointInfoSummary,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<EndpointInfoSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock service description
const mockServiceDescription = {
  endpoint: 'http://dbpedia.org/sparql',
  supportedLanguages: [
    'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',
  ],
  features: [],
  resultFormats: [],
  inputFormats: [],
  extensionFunctions: Array(12).fill({ uri: 'http://example.org/fn', label: 'Test' }),
  extensionAggregates: [],
  datasets: [
    {
      namedGraphs: [
        { name: 'http://dbpedia.org/graph1' },
        { name: 'http://dbpedia.org/graph2' },
        { name: 'http://dbpedia.org/graph3' },
      ],
      defaultGraphs: [],
    },
  ],
  lastFetched: new Date(Date.now() - 120000), // 2 minutes ago
  available: true,
};

export const Collapsed: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    expanded: false,
    showRefresh: true,
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', mockServiceDescription],
      ]),
    }));
  },
};

export const Expanded: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    expanded: true,
    showRefresh: true,
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', mockServiceDescription],
      ]),
    }));
  },
};

export const Loading: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    expanded: false,
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      loading: true,
    }));
  },
};

export const NoServiceDescription: Story = {
  args: {
    endpointUrl: 'http://example.org/sparql',
    expanded: false,
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://example.org/sparql', {
          ...mockServiceDescription,
          endpoint: 'http://example.org/sparql',
          available: false,
        }],
      ]),
    }));
  },
};

export const WithoutRefreshButton: Story = {
  args: {
    endpointUrl: 'http://dbpedia.org/sparql',
    expanded: false,
    showRefresh: false,
  },
  play: async () => {
    const store = getServiceDescriptionStore();
    store.update((state) => ({
      ...state,
      descriptions: new Map([
        ['http://dbpedia.org/sparql', mockServiceDescription],
      ]),
    }));
  },
};
```

### Step 6: Create Unit Tests
**File**: `tests/unit/components/Endpoint/EndpointInfoSummary.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EndpointInfoSummary from '$lib/components/Endpoint/EndpointInfoSummary.svelte';
import { createServiceDescriptionStore } from '$lib/stores/serviceDescriptionStore';

describe('EndpointInfoSummary', () => {
  const mockServiceDescription = {
    endpoint: 'http://dbpedia.org/sparql',
    supportedLanguages: [
      'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',
    ],
    features: [],
    resultFormats: [],
    inputFormats: [],
    extensionFunctions: Array(12).fill({ uri: 'http://example.org/fn', label: 'Test' }),
    extensionAggregates: [],
    datasets: [
      {
        namedGraphs: [
          { name: 'http://dbpedia.org/graph1' },
          { name: 'http://dbpedia.org/graph2' },
          { name: 'http://dbpedia.org/graph3' },
        ],
        defaultGraphs: [],
      },
    ],
    lastFetched: new Date(Date.now() - 120000), // 2 minutes ago
    available: true,
  };

  it('renders collapsed summary by default', async () => {
    const { container } = render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/SPARQL 1.1/)).toBeInTheDocument();
    });

    expect(container.querySelector('.expandable-tile')).not.toHaveClass('expanded');
  });

  it('displays correct summary statistics', async () => {
    render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/3 graphs/)).toBeInTheDocument();
      expect(screen.getByText(/12 functions/)).toBeInTheDocument();
      expect(screen.getByText(/2m ago/)).toBeInTheDocument();
    });
  });

  it('expands when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
      },
    });

    const expandButton = container.querySelector('.expandable-tile-button');
    await user.click(expandButton);

    await waitFor(() => {
      expect(container.querySelector('.expandable-tile')).toHaveClass('expanded');
    });
  });

  it('calls onToggle callback when expanded/collapsed', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { container } = render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
        onToggle,
      },
    });

    const expandButton = container.querySelector('.expandable-tile-button');
    await user.click(expandButton);

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(true);
    });
  });

  it('shows refresh button by default', async () => {
    render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
      },
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Refresh endpoint information')).toBeInTheDocument();
    });
  });

  it('hides refresh button when showRefresh is false', async () => {
    render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
        showRefresh: false,
      },
    });

    await waitFor(() => {
      expect(screen.queryByLabelText('Refresh endpoint information')).not.toBeInTheDocument();
    });
  });

  it('shows no service description message when unavailable', async () => {
    render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://example.org/sparql',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No service description available')).toBeInTheDocument();
    });
  });

  it('disables component when disabled prop is true', async () => {
    const { container } = render(EndpointInfoSummary, {
      props: {
        endpointUrl: 'http://dbpedia.org/sparql',
        disabled: true,
      },
    });

    expect(container.querySelector('.endpoint-info-summary')).toHaveClass('disabled');
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
- ✅ Renders collapsed by default
- ✅ Shows summary line with key statistics
- ✅ Expands/collapses on click
- ✅ Shows refresh button (when enabled)
- ✅ Triggers fetch on mount if not cached
- ✅ Handles loading state gracefully
- ✅ Shows error state when service description unavailable
- ✅ Formats time ago correctly (s, m, h, d)
- ✅ Calls onToggle callback when state changes

### Storybook Stories
- ✅ Collapsed story shows summary
- ✅ Expanded story shows dashboard slot
- ✅ Loading story shows skeleton
- ✅ No service description story shows error
- ✅ Without refresh button story hides button
- ✅ All stories render without errors

### Unit Tests
- ✅ All tests pass
- ✅ Coverage >80%
- ✅ Tests verify summary statistics
- ✅ Tests verify expand/collapse behavior
- ✅ Tests verify refresh button
- ✅ Tests verify disabled state
- ✅ Tests verify error handling

### Build & Quality Checks
```bash
npm run build               # ✅ 0 errors, 0 warnings
npm test                    # ✅ All tests pass
npm run lint                # ✅ No violations
npm run type-check          # ✅ No type errors
```

## Dependencies

**Prerequisite Tasks:**
- Task 70-75: Context-based store architecture (completed)

**Next Tasks:**
- Task 79: Create EndpointDashboard component (fills the dashboard slot)
- Task 79: Integrate with main query interface

## Troubleshooting

### Common Issues

**Issue**: ExpandableTile not working correctly
**Solution**: Check Carbon Svelte version and import path

**Issue**: Summary text truncated on narrow screens
**Solution**: Use CSS ellipsis and responsive font sizes

**Issue**: Store not found in context
**Solution**: Ensure component is wrapped in StoreProvider for tests

**Issue**: Time ago not updating
**Solution**: Add reactive update mechanism (optional enhancement)

## Future Enhancements

- **Auto-refresh**: Periodically update time ago text
- **Animations**: Smooth expand/collapse transition
- **Tooltips**: Show full text on hover when truncated
- **Badges**: Color-coded badges for different SPARQL versions
- **Quick Actions**: Add "Copy graph URIs" button

## References

- **Carbon ExpandableTile**: https://svelte.carbondesignsystem.com/components/ExpandableTile
- **Carbon Icons**: https://svelte.carbondesignsystem.com/icons
- **Service Description Store**: `src/lib/stores/serviceDescriptionStore.ts`

---

**Next Task**: [Task 79: Create EndpointDashboard Component](./78-endpoint-dashboard.md)
