# Components

Svelte 5 components for the SPARQL Query UI.

## Structure

- **Editor/** - SPARQL query editor with syntax highlighting and autocompletion
- **Endpoint/** - Endpoint selector and configuration
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
