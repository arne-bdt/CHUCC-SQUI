<script lang="ts">
  /**
   * Endpoint Selector Component
   * ComboBox for selecting SPARQL endpoints from a catalogue or entering custom URLs
   *
   * @component
   */

  import { ComboBox } from 'carbon-components-svelte';
  import { endpointCatalogue, defaultEndpoint } from '../../stores/endpointStore';
  import { validateEndpoint } from '../../utils/endpointValidator';
  import type { Endpoint } from '../../types';
  import type { ValidationResult } from '../../utils/endpointValidator';

  interface Props {
    /** Current endpoint URL value */
    value?: string;
    /** Callback when value changes */
    onchange?: (value: string) => void;
    /** Label for the selector */
    label?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Additional CSS class */
    class?: string;
    /** Whether to allow adding custom endpoints to catalogue */
    allowCustom?: boolean;
  }

  let {
    value = $bindable(''),
    onchange,
    label = 'SPARQL Endpoint',
    placeholder = 'Select an endpoint or enter URL',
    disabled = false,
    class: className = '',
    allowCustom = true,
  }: Props = $props();

  // Get catalogue from store
  let _catalogue = $state<Endpoint[]>([]);
  let _unsubscribe: (() => void) | undefined;

  // Subscribe to catalogue on mount
  $effect(() => {
    _unsubscribe = endpointCatalogue.subscribe((catalogue) => {
      _catalogue = catalogue;
    });

    return () => {
      _unsubscribe?.();
    };
  });

  // Validation state
  let _validationResult = $state<ValidationResult>({ valid: true });
  let _touched = $state(false);

  // Convert catalogue to ComboBox items
  const items = $derived(
    _catalogue.map((ep) => ({
      id: ep.url,
      text: ep.name,
      description: ep.description || '',
      url: ep.url,
    }))
  );

  // Derived state for error/warning display
  const invalid = $derived(!_validationResult.valid && _touched);
  const invalidText = $derived(_validationResult.error || '');
  const warn = $derived(!!_validationResult.warning && _touched && _validationResult.valid);
  const warnText = $derived(_validationResult.warning || '');

  /**
   * Handles selection or input changes
   */
  function handleSelect(
    event: CustomEvent<{
      selectedId: string;
      selectedItem: { id: string; text: string; url: string };
    }>
  ): void {
    const selectedItem = event.detail?.selectedItem;

    if (selectedItem) {
      // Selected from catalogue
      const newValue = selectedItem.url || selectedItem.id;
      value = newValue;

      // Update default endpoint store
      defaultEndpoint.set(newValue);

      // Call external change handler
      if (onchange) {
        onchange(newValue);
      }

      // Validate
      _touched = true;
      _validationResult = validateEndpoint(newValue);
    }
  }

  /**
   * Handles custom text input (for URLs not in catalogue)
   */
  function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    if (newValue) {
      value = newValue;

      // Update default endpoint store
      defaultEndpoint.set(newValue);

      // Call external change handler
      if (onchange) {
        onchange(newValue);
      }

      // Validate if touched
      if (_touched) {
        _validationResult = validateEndpoint(newValue);
      }
    }
  }

  /**
   * Handles blur event
   */
  function handleBlur(): void {
    _touched = true;
    _validationResult = validateEndpoint(value);

    // If custom endpoint and valid, optionally add to catalogue
    if (allowCustom && _validationResult.valid && value) {
      const existsInCatalogue = _catalogue.some((ep) => ep.url === value);
      if (!existsInCatalogue) {
        // Add custom endpoint to catalogue
        endpointCatalogue.addEndpoint({
          url: value,
          name: 'Custom Endpoint',
          description: value,
        });
      }
    }
  }

  /**
   * Programmatically trigger validation
   */
  export function validate(): ValidationResult {
    _touched = true;
    _validationResult = validateEndpoint(value);
    return _validationResult;
  }

  /**
   * Reset validation state
   */
  export function resetValidation(): void {
    _touched = false;
    _validationResult = { valid: true };
  }

  /**
   * Find selected item from catalogue
   */
  const selectedItem = $derived(
    items.find((item) => item.url === value) || { id: value, text: value, url: value }
  );
</script>

<div class="endpoint-selector-container {className}">
  <ComboBox
    titleText={label}
    {placeholder}
    {items}
    {disabled}
    {invalid}
    {invalidText}
    {warn}
    {warnText}
    selectedId={selectedItem?.id}
    shouldFilterItem={(item, inputValue) => {
      // Filter by name or URL
      const search = inputValue.toLowerCase();
      return (
        item.text.toLowerCase().includes(search) ||
        item.url.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
      );
    }}
    on:select={handleSelect}
    on:input={handleInput}
    on:blur={handleBlur}
  />
</div>

<style>
  .endpoint-selector-container {
    width: 100%;
  }

  /* Ensure Carbon ComboBox styles are applied correctly */
  :global(.endpoint-selector-container .bx--combo-box) {
    width: 100%;
  }

  /* Remove bottom margin to align with other toolbar elements */
  :global(.endpoint-selector-container .bx--list-box__wrapper) {
    margin-bottom: 0;
  }

  /* Ensure form item has no extra spacing */
  :global(.endpoint-selector-container .bx--form-item) {
    margin-bottom: 0;
  }

  :global(.endpoint-selector-container .bx--list-box__menu-item__option) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /* Style for endpoint descriptions in dropdown */
  :global(.endpoint-selector-container .bx--list-box__menu-item__option .description) {
    font-size: var(--cds-label-01);
    line-height: 1.34;
    color: var(--cds-text-secondary, #525252);
    margin-top: 0.125rem;
  }
</style>
