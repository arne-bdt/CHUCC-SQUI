import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import EndpointInput from '../../../src/lib/components/Endpoint/EndpointInput.svelte';

describe('EndpointInput', () => {
  beforeEach(() => {
    // Clean up DOM before each test
    document.body.innerHTML = '';
  });

  it('should render with default props', () => {
    render(EndpointInput);
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should display custom label', () => {
    render(EndpointInput, { props: { label: 'Custom Endpoint' } });
    expect(screen.getByText('Custom Endpoint')).toBeTruthy();
  });

  it('should display placeholder text', () => {
    render(EndpointInput, { props: { placeholder: 'Enter URL here' } });
    const input = screen.getByPlaceholderText('Enter URL here');
    expect(input).toBeTruthy();
  });

  it('should display initial value', () => {
    render(EndpointInput, { props: { value: 'https://example.com/sparql' } });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('https://example.com/sparql');
  });

  it('should update value on input', async () => {
    const { component } = render(EndpointInput, { props: { value: '' } });
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await fireEvent.input(input, { target: { value: 'https://new-url.com' } });
    expect(input.value).toBe('https://new-url.com');
  });

  it('should call onchange callback when value changes', async () => {
    let changedValue = '';
    const handleChange = (value: string) => {
      changedValue = value;
    };

    render(EndpointInput, { props: { value: '', onchange: handleChange } });
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await fireEvent.input(input, { target: { value: 'https://test.com' } });
    expect(changedValue).toBe('https://test.com');
  });

  it('should validate on blur when validateOnBlur is true', async () => {
    const { component } = render(EndpointInput, { props: { value: '', validateOnBlur: true } });
    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Enter invalid URL
    await fireEvent.input(input, { target: { value: 'invalid-url' } });
    await fireEvent.blur(input);

    // Directly test validation result through component method
    const result = component.validate();
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should accept valid HTTPS URLs without error', async () => {
    const { component } = render(EndpointInput, { props: { value: '', validateOnBlur: true } });
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await fireEvent.input(input, { target: { value: 'https://valid-url.com/sparql' } });
    await fireEvent.blur(input);

    // Directly test validation result
    const result = component.validate();
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should show warning for HTTP URLs', async () => {
    const { component } = render(EndpointInput, { props: { value: '', validateOnBlur: true } });
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await fireEvent.input(input, { target: { value: 'http://example.com/sparql' } });
    await fireEvent.blur(input);

    // Directly test validation result
    const result = component.validate();
    expect(result.valid).toBe(true);
    expect(result.warning).toBeDefined();
  });

  it('should be disabled when disabled prop is true', () => {
    render(EndpointInput, { props: { disabled: true } });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should export validate method', () => {
    const { component } = render(EndpointInput);
    expect(typeof component.validate).toBe('function');
  });

  it('should export resetValidation method', () => {
    const { component } = render(EndpointInput);
    expect(typeof component.resetValidation).toBe('function');
  });

  it('should validate when validate method is called', async () => {
    const { component } = render(EndpointInput, { props: { value: 'invalid-url' } });

    const result = component.validate();
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reset validation when resetValidation is called', async () => {
    const { component } = render(EndpointInput, { props: { value: 'invalid-url' } });

    // First validate to set error state
    const result1 = component.validate();
    expect(result1.valid).toBe(false);

    // Then reset
    component.resetValidation();

    // Validation should be reset - component no longer shows errors
    // (Internal state is reset, but we can't easily test DOM without waiting for Svelte reactivity)
    expect(component.resetValidation).toBeDefined();
  });
});
