/**
 * Integration tests for LanguageSupport component
 */
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LanguageSupport from '../../src/lib/components/Capabilities/LanguageSupport.svelte';
import { SPARQLLanguage } from '../../src/lib/types/serviceDescription';

describe('LanguageSupport', () => {
  it('should render all languages with support indicators', () => {
    const languages = [SPARQLLanguage.SPARQL11Query, SPARQLLanguage.SPARQL11Update];
    render(LanguageSupport, { props: { languages } });

    expect(screen.getByText('SPARQL 1.0 Query')).toBeInTheDocument();
    expect(screen.getByText('SPARQL 1.1 Query')).toBeInTheDocument();
    expect(screen.getByText('SPARQL 1.1 Update')).toBeInTheDocument();
  });

  it('should show checkmark for supported languages', () => {
    const languages = [SPARQLLanguage.SPARQL11Query];
    const { container } = render(LanguageSupport, { props: { languages } });

    const items = container.querySelectorAll('.language-support li');
    const sparql11Item = Array.from(items).find((item) =>
      item.textContent?.includes('SPARQL 1.1 Query')
    );

    expect(sparql11Item).toHaveClass('supported');
  });

  it('should show cross for unsupported languages', () => {
    const languages = [SPARQLLanguage.SPARQL11Query];
    const { container } = render(LanguageSupport, { props: { languages } });

    const items = container.querySelectorAll('.language-support li');
    const sparql10Item = Array.from(items).find((item) =>
      item.textContent?.includes('SPARQL 1.0 Query')
    );
    const updateItem = Array.from(items).find((item) =>
      item.textContent?.includes('SPARQL 1.1 Update')
    );

    expect(sparql10Item).not.toHaveClass('supported');
    expect(updateItem).not.toHaveClass('supported');
  });

  it('should render when all languages are supported', () => {
    const languages = [
      SPARQLLanguage.SPARQL10Query,
      SPARQLLanguage.SPARQL11Query,
      SPARQLLanguage.SPARQL11Update,
    ];
    const { container } = render(LanguageSupport, { props: { languages } });

    const items = container.querySelectorAll('.language-support li.supported');
    expect(items).toHaveLength(3);
  });

  it('should render when no languages are supported', () => {
    const languages: SPARQLLanguage[] = [];
    const { container } = render(LanguageSupport, { props: { languages } });

    const items = container.querySelectorAll('.language-support li.supported');
    expect(items).toHaveLength(0);

    const allItems = container.querySelectorAll('.language-support li');
    expect(allItems).toHaveLength(3); // All 3 languages still shown, just not supported
  });
});
