/**
 * Unit Tests for UriCell Component
 * Tests clickable IRI links functionality (Task 23)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import UriCell from '../../../src/lib/components/Results/UriCell.svelte';
import type { ParsedCell } from '../../../src/lib/utils/resultsParser';

describe('UriCell', () => {
  const mockColumn = { id: 'subject' };

  describe('URI rendering', () => {
    it('renders URI as clickable link', () => {
      const uriCell: ParsedCell & { displayValue: string } = {
        type: 'uri',
        value: 'http://dbpedia.org/resource/Albert_Einstein',
        rawValue: 'http://dbpedia.org/resource/Albert_Einstein',
        displayValue: 'dbr:Albert_Einstein',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.textContent).toBe('dbr:Albert_Einstein');
    });

    it('sets correct href attribute to raw IRI', () => {
      const uriCell: ParsedCell & { displayValue: string } = {
        type: 'uri',
        value: 'http://xmlns.com/foaf/0.1/Person',
        rawValue: 'http://xmlns.com/foaf/0.1/Person',
        displayValue: 'foaf:Person',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link?.getAttribute('href')).toBe('http://xmlns.com/foaf/0.1/Person');
    });

    it('sets target="_blank" for external navigation', () => {
      const uriCell: ParsedCell & { displayValue: string } = {
        type: 'uri',
        value: 'http://example.org/resource',
        rawValue: 'http://example.org/resource',
        displayValue: 'http://example.org/resource',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link?.getAttribute('target')).toBe('_blank');
    });

    it('sets rel="noopener noreferrer" for security', () => {
      const uriCell: ParsedCell & { displayValue: string } = {
        type: 'uri',
        value: 'http://example.org/resource',
        rawValue: 'http://example.org/resource',
        displayValue: 'http://example.org/resource',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('sets title attribute with full IRI for tooltip', () => {
      const uriCell: ParsedCell & { displayValue: string } = {
        type: 'uri',
        value: 'http://www.wikidata.org/entity/Q42',
        rawValue: 'http://www.wikidata.org/entity/Q42',
        displayValue: 'wd:Q42',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link?.getAttribute('title')).toBe('http://www.wikidata.org/entity/Q42');
    });

    it('applies uri-link CSS class', () => {
      const uriCell: ParsedCell & { displayValue: string } = {
        type: 'uri',
        value: 'http://example.org/test',
        rawValue: 'http://example.org/test',
        displayValue: 'http://example.org/test',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link?.classList.contains('uri-link')).toBe(true);
    });

    it('handles URI without displayValue fallback', () => {
      const uriCell: ParsedCell = {
        type: 'uri',
        value: 'http://example.org/resource',
        rawValue: 'http://example.org/resource',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.textContent).toBe('http://example.org/resource');
    });

    it('handles URI with abbreviated displayValue', () => {
      const uriCell: ParsedCell & { displayValue: string } = {
        type: 'uri',
        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        rawValue: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        displayValue: 'rdf:type',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: uriCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link?.textContent).toBe('rdf:type');
      expect(link?.getAttribute('href')).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    });
  });

  describe('Literal rendering', () => {
    it('renders literal as plain text (not a link)', () => {
      const literalCell: ParsedCell & { displayValue: string } = {
        type: 'literal',
        value: 'Albert Einstein',
        displayValue: '"Albert Einstein"@en',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: literalCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link).toBeNull();
      expect(container.textContent).toBe('"Albert Einstein"@en');
    });

    it('renders literal with language tag', () => {
      const literalCell: ParsedCell & { displayValue: string } = {
        type: 'literal',
        value: 'Hello World',
        lang: 'en',
        displayValue: '"Hello World"@en',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: literalCell },
          column: mockColumn,
        },
      });

      expect(container.textContent).toBe('"Hello World"@en');
      const link = container.querySelector('a');
      expect(link).toBeNull();
    });

    it('renders literal with datatype', () => {
      const literalCell: ParsedCell & { displayValue: string } = {
        type: 'literal',
        value: '42',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
        displayValue: '"42"^^xsd:integer',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: literalCell },
          column: mockColumn,
        },
      });

      expect(container.textContent).toBe('"42"^^xsd:integer');
      const link = container.querySelector('a');
      expect(link).toBeNull();
    });
  });

  describe('Blank node rendering', () => {
    it('renders blank node as plain text (not a link)', () => {
      const blankCell: ParsedCell & { displayValue: string } = {
        type: 'bnode',
        value: '_:b0',
        rawValue: '_:b0',
        displayValue: '_:b0',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: blankCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link).toBeNull();
      expect(container.textContent).toBe('_:b0');
    });
  });

  describe('Unbound variable rendering', () => {
    it('renders unbound variable as empty text', () => {
      const unboundCell: ParsedCell & { displayValue: string } = {
        type: 'unbound',
        value: '',
        displayValue: '',
      };

      const { container } = render(UriCell, {
        props: {
          row: { subject: unboundCell },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link).toBeNull();
      expect(container.textContent?.trim()).toBe('');
    });
  });

  describe('String fallback', () => {
    it('handles plain string values (backward compatibility)', () => {
      const { container } = render(UriCell, {
        props: {
          row: { subject: 'Plain text value' },
          column: mockColumn,
        },
      });

      const link = container.querySelector('a');
      expect(link).toBeNull();
      expect(container.textContent).toBe('Plain text value');
    });

    it('handles empty string', () => {
      const { container } = render(UriCell, {
        props: {
          row: { subject: '' },
          column: mockColumn,
        },
      });

      expect(container.textContent?.trim()).toBe('');
    });
  });

  describe('Edge cases', () => {
    it('handles undefined cell data', () => {
      const { container } = render(UriCell, {
        props: {
          row: { subject: undefined },
          column: mockColumn,
        },
      });

      expect(container.textContent?.trim()).toBe('');
    });

    it('handles null cell data', () => {
      const { container } = render(UriCell, {
        props: {
          row: { subject: null },
          column: mockColumn,
        },
      });

      expect(container.textContent?.trim()).toBe('');
    });

    it('handles missing column in row', () => {
      const { container } = render(UriCell, {
        props: {
          row: {},
          column: mockColumn,
        },
      });

      expect(container.textContent?.trim()).toBe('');
    });
  });

  describe('Multiple URIs in same row', () => {
    it('renders different URIs with different display values', () => {
      const row = {
        subject: {
          type: 'uri',
          value: 'http://dbpedia.org/resource/Albert_Einstein',
          rawValue: 'http://dbpedia.org/resource/Albert_Einstein',
          displayValue: 'dbr:Albert_Einstein',
        },
        predicate: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          rawValue: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          displayValue: 'rdf:type',
        },
      };

      const { container: container1 } = render(UriCell, {
        props: {
          row,
          column: { id: 'subject' },
        },
      });

      const { container: container2 } = render(UriCell, {
        props: {
          row,
          column: { id: 'predicate' },
        },
      });

      const link1 = container1.querySelector('a');
      const link2 = container2.querySelector('a');

      expect(link1?.textContent).toBe('dbr:Albert_Einstein');
      expect(link2?.textContent).toBe('rdf:type');

      expect(link1?.getAttribute('href')).toBe('http://dbpedia.org/resource/Albert_Einstein');
      expect(link2?.getAttribute('href')).toBe(
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
      );
    });
  });
});
