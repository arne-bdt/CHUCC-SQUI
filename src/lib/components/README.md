# Components

Svelte 5 components for the SPARQL Query UI.

## Structure

- **Editor/** - SPARQL query editor with syntax highlighting and autocompletion
- **Endpoint/** - Endpoint selector, configuration, and dashboard
  - EndpointSelector - Endpoint selection with catalogue
  - EndpointInfoSummary - Collapsible summary bar with endpoint capabilities
  - EndpointDashboard - Tabbed interface for capabilities, datasets, and functions
- **Capabilities/** - Endpoint capability display components
- **Functions/** - Extension function library and details
- **Results/** - Result visualization (table, raw, boolean views)
- **Tabs/** - Multi-query tab management
- **Toolbar/** - Action buttons and controls

## Development

Each component should:

- Use Svelte 5 runes ($state, $derived, $effect)
- Follow Carbon Design System guidelines
- Be fully accessible (WCAG 2.1 AA)
- Include comprehensive tests
- Export TypeScript types

## Example Component

```svelte
<script lang="ts">
  interface Props {
    value: string;
    onValueChange?: (value: string) => void;
  }

  let { value, onValueChange }: Props = $props();
  let localValue = $state(value);

  $effect(() => {
    localValue = value;
  });
</script>

<div class="component">
  <!-- Implementation -->
</div>
```
