# Task 53: Endpoint Feature Detection and Capabilities Display

## Overview

Display SPARQL endpoint capabilities and features in the UI based on Service Description metadata. Provide visual indicators for supported languages, features, and formats.

## Motivation

Users need to know what an endpoint supports before writing queries. Service Description provides comprehensive capability information that should be surfaced in the UI to:
- Show supported SPARQL versions (1.0, 1.1 Query, 1.1 Update)
- Display available features (URI dereferencing, federated query, etc.)
- List supported result formats
- Show available extension functions and aggregates

## Requirements

### Capabilities Panel

1. **Endpoint Info Card**
   - Display in sidebar or collapsible panel
   - Show when service description is available
   - Update reactively when endpoint changes
   - Provide refresh button to re-fetch metadata

2. **Capability Categories**

   **Supported Languages:**
   - SPARQL 1.0 Query
   - SPARQL 1.1 Query
   - SPARQL 1.1 Update
   - Visual indicators: ✅ Supported, ❌ Not supported

   **Service Features:**
   - URI Dereferencing (FROM/FROM NAMED)
   - Union Default Graph
   - Empty Graphs Support
   - Basic Federated Query (SERVICE)
   - Dataset Requirements

   **Result Formats:**
   - Display as tags/chips (e.g., JSON, XML, CSV, TSV, Turtle)
   - Highlight currently selected format
   - Allow click to switch format

   **Extension Functions/Aggregates:**
   - Collapsible list of custom functions
   - Show function URI and label (if available)
   - Link to documentation (if provided in metadata)

3. **Dataset Information**
   - Number of available named graphs
   - Total triple count (if available from voiD)
   - Entailment regimes in use
   - Link to full dataset description

### UI Components

```typescript
// src/lib/components/EndpointCapabilities.svelte

<script lang="ts">
  import { Tag, ExpandableTile, SkeletonText } from 'carbon-components-svelte';
  import { serviceDescriptionStore } from '$lib/stores/serviceDescriptionStore';
  import { endpointStore } from '$lib/stores/endpointStore';

  const currentEndpoint = $derived($endpointStore.url);
  const serviceDesc = $derived(
    $serviceDescriptionStore.descriptions.get(currentEndpoint)
  );
  const loading = $derived($serviceDescriptionStore.loading);

  function refreshCapabilities() {
    serviceDescriptionStore.refreshCurrent();
  }
</script>

{#if loading}
  <SkeletonText />
{:else if serviceDesc}
  <div class="capabilities-panel">
    <h3>Endpoint Capabilities</h3>

    <section>
      <h4>SPARQL Support</h4>
      <LanguageSupport languages={serviceDesc.supportedLanguages} />
    </section>

    <section>
      <h4>Features</h4>
      <FeatureList features={serviceDesc.features} />
    </section>

    <section>
      <h4>Result Formats</h4>
      <FormatList formats={serviceDesc.resultFormats} />
    </section>

    {#if serviceDesc.extensionFunctions.length > 0}
      <ExpandableTile>
        <div slot="above">
          Extension Functions ({serviceDesc.extensionFunctions.length})
        </div>
        <div slot="below">
          <ExtensionList items={serviceDesc.extensionFunctions} />
        </div>
      </ExpandableTile>
    {/if}

    {#if serviceDesc.datasets.length > 0}
      <section>
        <h4>Datasets</h4>
        <DatasetInfo datasets={serviceDesc.datasets} />
      </section>
    {/if}
  </div>
{:else}
  <div class="no-service-description">
    <p>Service description not available for this endpoint.</p>
    <button on:click={refreshCapabilities}>Try to Fetch</button>
  </div>
{/if}
```

### Capability Indicator Components

```typescript
// src/lib/components/capabilities/LanguageSupport.svelte

<script lang="ts">
  import type { SPARQLLanguage } from '$lib/types/serviceDescription';
  import { CheckmarkFilled, CloseFilled } from 'carbon-icons-svelte';

  interface Props {
    languages: SPARQLLanguage[];
  }

  let { languages }: Props = $props();

  const allLanguages = [
    { id: SPARQLLanguage.SPARQL10Query, label: 'SPARQL 1.0 Query' },
    { id: SPARQLLanguage.SPARQL11Query, label: 'SPARQL 1.1 Query' },
    { id: SPARQLLanguage.SPARQL11Update, label: 'SPARQL 1.1 Update' },
  ];

  function isSupported(langId: SPARQLLanguage): boolean {
    return languages.includes(langId);
  }
</script>

<ul class="language-support">
  {#each allLanguages as lang}
    <li class:supported={isSupported(lang.id)}>
      {#if isSupported(lang.id)}
        <CheckmarkFilled size={16} />
      {:else}
        <CloseFilled size={16} />
      {/if}
      <span>{lang.label}</span>
    </li>
  {/each}
</ul>

<style>
  .language-support {
    list-style: none;
    padding: 0;
  }

  .language-support li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    color: var(--cds-text-secondary);
  }

  .language-support li.supported {
    color: var(--cds-text-primary);
  }

  .language-support li :global(svg) {
    flex-shrink: 0;
  }

  .language-support li.supported :global(svg) {
    fill: var(--cds-support-success);
  }

  .language-support li:not(.supported) :global(svg) {
    fill: var(--cds-text-disabled);
  }
</style>
```

```typescript
// src/lib/components/capabilities/FeatureList.svelte

<script lang="ts">
  import type { ServiceFeature } from '$lib/types/serviceDescription';
  import { Tag } from 'carbon-components-svelte';

  interface Props {
    features: ServiceFeature[];
  }

  let { features }: Props = $props();

  const featureLabels: Record<string, string> = {
    DereferencesURIs: 'URI Dereferencing',
    UnionDefaultGraph: 'Union Default Graph',
    RequiresDataset: 'Requires Dataset',
    EmptyGraphs: 'Empty Graphs',
    BasicFederatedQuery: 'Federated Query (SERVICE)',
  };

  function getFeatureLabel(feature: ServiceFeature): string {
    const key = feature.split('#').pop() || '';
    return featureLabels[key] || key;
  }
</script>

<div class="feature-list">
  {#each features as feature}
    <Tag type="blue" size="sm">{getFeatureLabel(feature)}</Tag>
  {/each}

  {#if features.length === 0}
    <p class="empty-state">No special features reported</p>
  {/if}
</div>

<style>
  .feature-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .empty-state {
    color: var(--cds-text-secondary);
    font-style: italic;
  }
</style>
```

### Sidebar Integration

```typescript
// src/lib/components/Sidebar.svelte

<script lang="ts">
  import { Accordion, AccordionItem } from 'carbon-components-svelte';
  import EndpointCapabilities from './EndpointCapabilities.svelte';

  // ... existing sidebar content
</script>

<aside class="sidebar">
  <Accordion>
    <!-- Existing accordion items -->

    <AccordionItem title="Endpoint Capabilities">
      <EndpointCapabilities />
    </AccordionItem>
  </Accordion>
</aside>
```

### Status Indicator in Header

```typescript
// src/lib/components/Header.svelte

<script lang="ts">
  import { InformationFilled } from 'carbon-icons-svelte';
  import { Tooltip } from 'carbon-components-svelte';
  import { serviceDescriptionStore } from '$lib/stores/serviceDescriptionStore';

  const hasServiceDescription = $derived(
    $serviceDescriptionStore.currentEndpoint !== null &&
    $serviceDescriptionStore.descriptions.has($serviceDescriptionStore.currentEndpoint)
  );
</script>

<header>
  <!-- Existing header content -->

  {#if hasServiceDescription}
    <div class="service-indicator">
      <Tooltip align="bottom" direction="left">
        <button class="info-button">
          <InformationFilled size={16} />
        </button>
        <span slot="tooltipText">
          Endpoint capabilities available (click for details)
        </span>
      </Tooltip>
    </div>
  {/if}
</header>
```

## Implementation Steps

1. **Create Capability Components**
   - Implement `LanguageSupport.svelte`
   - Implement `FeatureList.svelte`
   - Implement `FormatList.svelte`
   - Implement `ExtensionList.svelte`
   - Implement `DatasetInfo.svelte`

2. **Create Main Panel Component**
   - Implement `EndpointCapabilities.svelte`
   - Integrate all sub-components
   - Add loading/error states
   - Add refresh functionality

3. **Integrate with Sidebar**
   - Add accordion item to Sidebar component
   - Ensure proper collapsing/expanding behavior
   - Test responsiveness

4. **Add Status Indicators**
   - Add header indicator for service description availability
   - Show visual cue when capabilities are loaded
   - Link to sidebar panel

5. **Styling**
   - Follow Carbon Design System guidelines
   - Ensure dark mode compatibility
   - Make responsive for mobile viewports

6. **Testing**
   - Unit tests for each capability component
   - Integration tests for main panel
   - Storybook stories for all states (loading, loaded, error, no data)
   - E2E tests for sidebar interaction

## Acceptance Criteria

- ✅ Capabilities panel displays all service description metadata
- ✅ Language support shows checkmarks/crosses for each SPARQL version
- ✅ Features displayed as readable tags
- ✅ Result formats shown as selectable chips
- ✅ Extension functions listed with URIs and labels
- ✅ Dataset information displayed (graph count, triples)
- ✅ Panel integrates cleanly with sidebar
- ✅ Refresh button re-fetches service description
- ✅ Loading skeleton shows during fetch
- ✅ Graceful message when service description unavailable
- ✅ Carbon Design System styling applied throughout
- ✅ Dark mode works correctly
- ✅ Responsive on mobile viewports
- ✅ All tests pass (`npm test`)
- ✅ Build succeeds with no warnings (`npm run build`)
- ✅ E2E tests verify UI interactions (`npm run test:e2e:storybook`)

## User Experience

**User Workflow:**
1. Connect to new SPARQL endpoint
2. Click "Endpoint Capabilities" in sidebar
3. See at a glance:
   - SPARQL 1.1 Query: ✅
   - SPARQL 1.1 Update: ❌
   - Federated Query: ✅
   - 42 named graphs available
   - 5 extension functions
4. Click refresh to update metadata
5. Use this info to write compatible queries

## Dependencies

- Task 51 (Service Description Core) must be completed first
- Carbon Components Svelte (already integrated)
- Carbon Icons Svelte (already integrated)

## Future Enhancements

- Export capabilities report as JSON/Markdown
- Compare capabilities across multiple endpoints
- Warn when query uses unsupported features (see Task 54)
- Link to endpoint documentation from capabilities panel
- Show capability history/changes over time

## References

- [SPARQL 1.1 Service Description](https://www.w3.org/TR/sparql11-service-description/)
- [Carbon Design System - Accordion](https://svelte.carbondesignsystem.com/components/Accordion)
- [Carbon Design System - Tag](https://svelte.carbondesignsystem.com/components/Tag)
