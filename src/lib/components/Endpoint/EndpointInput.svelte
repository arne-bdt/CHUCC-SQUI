<script lang="ts">
  /**
   * Endpoint Input Component
   * Text input for entering SPARQL endpoint URLs with validation
   *
   * @component
   */

  import { TextInput } from 'carbon-components-svelte';
  import { validateEndpoint } from '../../utils/endpointValidator';
  import type { ValidationResult } from '../../utils/endpointValidator';

  interface Props {
    /** Current endpoint URL value */
    value?: string;
    /** Callback when value changes */
    onchange?: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Label for the input */
    label?: string;
    /** Whether to show validation on blur */
    validateOnBlur?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Additional CSS class */
    class?: string;
  }

  let {
    value = $bindable(''),
    onchange,
    placeholder = 'https://example.com/sparql',
    label = 'SPARQL Endpoint',
    validateOnBlur = true,
    disabled = false,
    class: className = '',
  }: Props = $props();

  // Internal state
  let _validationResult = $state<ValidationResult>({ valid: true });
  let _touched = $state(false);

  // Derived state for error/warning display
  const invalid = $derived(!_validationResult.valid && _touched);
  const invalidText = $derived(_validationResult.error || '');
  const warn = $derived(!!_validationResult.warning && _touched && _validationResult.valid);
  const warnText = $derived(_validationResult.warning || '');

  /**
   * Handles input value changes
   */
  function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    value = newValue;

    // Call external change handler if provided
    if (onchange) {
      onchange(newValue);
    }

    // Validate if already touched
    if (_touched) {
      _validationResult = validateEndpoint(newValue);
    }
  }

  /**
   * Handles input blur (focus lost)
   */
  function handleBlur(): void {
    _touched = true;
    if (validateOnBlur) {
      _validationResult = validateEndpoint(value);
    }
  }

  /**
   * Programmatically trigger validation
   * Can be called from parent component
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
</script>

<div class="endpoint-input-container {className}">
  <TextInput
    labelText={label}
    {placeholder}
    {value}
    {disabled}
    {invalid}
    {invalidText}
    {warn}
    {warnText}
    oninput={handleInput}
    onblur={handleBlur}
    helperText="Enter the URL of a SPARQL endpoint"
  />
</div>

<style>
  .endpoint-input-container {
    width: 100%;
  }

  /* Ensure Carbon styles are applied correctly */
  :global(.endpoint-input-container .bx--text-input) {
    width: 100%;
  }
</style>
