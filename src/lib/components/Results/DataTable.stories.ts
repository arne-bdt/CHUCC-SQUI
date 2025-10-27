/**
 * DataTable Component Stories
 * Demonstrates SPARQL results table with various data scenarios
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import { expect } from 'vitest';
import DataTable from './DataTable.svelte';
import type { ParsedTableData } from '../../utils/resultsParser';

const meta = {
  title: 'Results/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    virtualScroll: {
      control: 'boolean',
      description: 'Enable virtual scrolling for large datasets',
    },
    rowHeight: {
      control: { type: 'number', min: 24, max: 60, step: 4 },
      description: 'Row height in pixels',
    },
  },
} satisfies Meta<DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data: DBpedia-style results
const dbpediaData: ParsedTableData = {
  columns: ['person', 'name', 'birthDate', 'nationality'],
  rows: [
    {
      person: {
        value: 'http://dbpedia.org/resource/Albert_Einstein',
        type: 'uri',
        rawValue: 'http://dbpedia.org/resource/Albert_Einstein',
      },
      name: { value: 'Albert Einstein', type: 'literal', lang: 'en' },
      birthDate: {
        value: '1879-03-14',
        type: 'literal',
        datatype: 'http://www.w3.org/2001/XMLSchema#date',
      },
      nationality: { value: 'German', type: 'literal', lang: 'en' },
    },
    {
      person: {
        value: 'http://dbpedia.org/resource/Marie_Curie',
        type: 'uri',
        rawValue: 'http://dbpedia.org/resource/Marie_Curie',
      },
      name: { value: 'Marie Curie', type: 'literal', lang: 'en' },
      birthDate: {
        value: '1867-11-07',
        type: 'literal',
        datatype: 'http://www.w3.org/2001/XMLSchema#date',
      },
      nationality: { value: 'Polish', type: 'literal', lang: 'en' },
    },
    {
      person: {
        value: 'http://dbpedia.org/resource/Isaac_Newton',
        type: 'uri',
        rawValue: 'http://dbpedia.org/resource/Isaac_Newton',
      },
      name: { value: 'Isaac Newton', type: 'literal', lang: 'en' },
      birthDate: {
        value: '1643-01-04',
        type: 'literal',
        datatype: 'http://www.w3.org/2001/XMLSchema#date',
      },
      nationality: { value: 'English', type: 'literal', lang: 'en' },
    },
  ],
  rowCount: 3,
  vars: ['person', 'name', 'birthDate', 'nationality'],
};

// Large dataset for testing virtual scrolling
const generateLargeData = (rowCount: number): ParsedTableData => {
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push({
      id: {
        value: `http://example.org/resource/${i}`,
        type: 'uri' as const,
        rawValue: `http://example.org/resource/${i}`,
      },
      name: { value: `Item ${i}`, type: 'literal' as const },
      value: {
        value: String(Math.floor(Math.random() * 1000)),
        type: 'literal' as const,
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      },
      date: {
        value: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
        type: 'literal' as const,
        datatype: 'http://www.w3.org/2001/XMLSchema#date',
      },
    });
  }
  return {
    columns: ['id', 'name', 'value', 'date'],
    rows,
    rowCount: rows.length,
    vars: ['id', 'name', 'value', 'date'],
  };
};

// Multilingual data (Wikidata-style)
const multilingualData: ParsedTableData = {
  columns: ['item', 'labelEN', 'labelDE', 'labelFR', 'labelES'],
  rows: [
    {
      item: {
        value: 'http://www.wikidata.org/entity/Q5',
        type: 'uri',
        rawValue: 'http://www.wikidata.org/entity/Q5',
      },
      labelEN: { value: 'human', type: 'literal', lang: 'en' },
      labelDE: { value: 'Mensch', type: 'literal', lang: 'de' },
      labelFR: { value: 'humain', type: 'literal', lang: 'fr' },
      labelES: { value: 'ser humano', type: 'literal', lang: 'es' },
    },
    {
      item: {
        value: 'http://www.wikidata.org/entity/Q146',
        type: 'uri',
        rawValue: 'http://www.wikidata.org/entity/Q146',
      },
      labelEN: { value: 'cat', type: 'literal', lang: 'en' },
      labelDE: { value: 'Hauskatze', type: 'literal', lang: 'de' },
      labelFR: { value: 'chat', type: 'literal', lang: 'fr' },
      labelES: { value: 'gato', type: 'literal', lang: 'es' },
    },
  ],
  rowCount: 2,
  vars: ['item', 'labelEN', 'labelDE', 'labelFR', 'labelES'],
};

// Data with unbound variables
const unboundData: ParsedTableData = {
  columns: ['subject', 'predicate', 'object', 'optional'],
  rows: [
    {
      subject: {
        value: 'http://example.org/s1',
        type: 'uri',
        rawValue: 'http://example.org/s1',
      },
      predicate: {
        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        type: 'uri',
        rawValue: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      },
      object: {
        value: 'http://xmlns.com/foaf/0.1/Person',
        type: 'uri',
        rawValue: 'http://xmlns.com/foaf/0.1/Person',
      },
      optional: { value: 'Has value', type: 'literal' },
    },
    {
      subject: {
        value: 'http://example.org/s2',
        type: 'uri',
        rawValue: 'http://example.org/s2',
      },
      predicate: {
        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        type: 'uri',
        rawValue: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      },
      object: {
        value: 'http://xmlns.com/foaf/0.1/Organization',
        type: 'uri',
        rawValue: 'http://xmlns.com/foaf/0.1/Organization',
      },
      optional: { value: '', type: 'unbound' }, // Unbound variable
    },
  ],
  rowCount: 2,
  vars: ['subject', 'predicate', 'object', 'optional'],
};

// Empty results
const emptyData: ParsedTableData = {
  columns: ['s', 'p', 'o'],
  rows: [],
  rowCount: 0,
  vars: ['s', 'p', 'o'],
};

// IRI Abbreviation showcase (Task 22)
const iriAbbreviationData: ParsedTableData = {
  columns: ['subject', 'predicate', 'object', 'type'],
  rows: [
    {
      subject: {
        value: 'http://dbpedia.org/resource/Albert_Einstein',
        type: 'uri',
        rawValue: 'http://dbpedia.org/resource/Albert_Einstein',
      },
      predicate: {
        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        type: 'uri',
        rawValue: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      },
      object: {
        value: 'http://xmlns.com/foaf/0.1/Person',
        type: 'uri',
        rawValue: 'http://xmlns.com/foaf/0.1/Person',
      },
      type: { value: 'RDF namespace abbreviation', type: 'literal' },
    },
    {
      subject: {
        value: 'http://www.wikidata.org/entity/Q42',
        type: 'uri',
        rawValue: 'http://www.wikidata.org/entity/Q42',
      },
      predicate: {
        value: 'http://www.wikidata.org/prop/direct/P31',
        type: 'uri',
        rawValue: 'http://www.wikidata.org/prop/direct/P31',
      },
      object: {
        value: 'http://www.wikidata.org/entity/Q5',
        type: 'uri',
        rawValue: 'http://www.wikidata.org/entity/Q5',
      },
      type: { value: 'Wikidata namespace abbreviation', type: 'literal' },
    },
    {
      subject: {
        value: 'http://schema.org/Person',
        type: 'uri',
        rawValue: 'http://schema.org/Person',
      },
      predicate: {
        value: 'http://www.w3.org/2000/01/rdf-schema#label',
        type: 'uri',
        rawValue: 'http://www.w3.org/2000/01/rdf-schema#label',
      },
      object: { value: 'Person', type: 'literal', lang: 'en' },
      type: { value: 'Schema.org namespace abbreviation', type: 'literal' },
    },
    {
      subject: {
        value: 'http://purl.org/dc/terms/title',
        type: 'uri',
        rawValue: 'http://purl.org/dc/terms/title',
      },
      predicate: {
        value: 'http://www.w3.org/2002/07/owl#equivalentProperty',
        type: 'uri',
        rawValue: 'http://www.w3.org/2002/07/owl#equivalentProperty',
      },
      object: {
        value: 'http://purl.org/dc/elements/1.1/title',
        type: 'uri',
        rawValue: 'http://purl.org/dc/elements/1.1/title',
      },
      type: { value: 'Dublin Core namespace abbreviation', type: 'literal' },
    },
    {
      subject: {
        value: 'http://www.w3.org/2004/02/skos/core#Concept',
        type: 'uri',
        rawValue: 'http://www.w3.org/2004/02/skos/core#Concept',
      },
      predicate: {
        value: 'http://www.w3.org/2004/02/skos/core#prefLabel',
        type: 'uri',
        rawValue: 'http://www.w3.org/2004/02/skos/core#prefLabel',
      },
      object: { value: 'Concept', type: 'literal', lang: 'en' },
      type: { value: 'SKOS namespace abbreviation', type: 'literal' },
    },
    {
      subject: {
        value: 'http://example.org/custom/namespace/Resource1',
        type: 'uri',
        rawValue: 'http://example.org/custom/namespace/Resource1',
      },
      predicate: {
        value: 'http://custom-domain.com/ontology/hasProperty',
        type: 'uri',
        rawValue: 'http://custom-domain.com/ontology/hasProperty',
      },
      object: { value: 'CustomValue', type: 'literal' },
      type: { value: 'No prefix match - full IRI displayed', type: 'literal' },
    },
  ],
  rowCount: 6,
  vars: ['subject', 'predicate', 'object', 'type'],
};

export const Default: Story = {
  args: {
    data: dbpediaData,
    virtualScroll: true,
    rowHeight: 32,
  },
  play: async ({ canvasElement }) => {
    // Verify DataTable renders
    const resultsInfo = canvasElement.querySelector('.results-info');
    expect(resultsInfo).toBeTruthy();
    expect(resultsInfo?.textContent).toContain('3 results');
    expect(resultsInfo?.textContent).toContain('4 variables');

    // Verify grid container exists
    const gridContainer = canvasElement.querySelector('.data-table-container');
    expect(gridContainer).toBeTruthy();
  },
};

export const SmallDataset: Story = {
  args: {
    data: dbpediaData,
    virtualScroll: false,
    rowHeight: 32,
  },
};

export const LargeDataset100: Story = {
  args: {
    data: generateLargeData(100),
    virtualScroll: true,
    rowHeight: 32,
  },
};

export const LargeDataset1000: Story = {
  args: {
    data: generateLargeData(1000),
    virtualScroll: true,
    rowHeight: 32,
  },
};

export const LargeDataset10000: Story = {
  args: {
    data: generateLargeData(10000),
    virtualScroll: true,
    rowHeight: 32,
  },
  play: async ({ canvasElement }) => {
    // CRITICAL TEST: This catches the infinite $derived loop freeze bug!
    // Should render 10,000 rows without freezing the browser
    const startTime = performance.now();

    // Wait for DataTable to render (with timeout to catch infinite loops)
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max (100 * 100ms)

    while (attempts < maxAttempts) {
      const gridContainer = canvasElement.querySelector('.data-table-container');
      if (gridContainer) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    const renderTime = performance.now() - startTime;

    // Verify it rendered
    const gridContainer = canvasElement.querySelector('.data-table-container');
    expect(gridContainer).toBeTruthy();

    // Verify count is correct
    const resultsInfo = canvasElement.querySelector('.results-info');
    expect(resultsInfo?.textContent).toContain('10000 results');
    expect(resultsInfo?.textContent).toContain('4 variables');

    // Performance assertion: Should render in under 5 seconds
    // This catches infinite reactivity loops and browser freezes
    expect(renderTime).toBeLessThan(5000);
  },
};

export const MultilingualLabels: Story = {
  args: {
    data: multilingualData,
    virtualScroll: false,
    rowHeight: 32,
  },
};

export const WithUnboundVariables: Story = {
  args: {
    data: unboundData,
    virtualScroll: false,
    rowHeight: 32,
  },
};

export const EmptyResults: Story = {
  args: {
    data: emptyData,
    virtualScroll: false,
    rowHeight: 32,
  },
  play: async ({ canvasElement }) => {
    // Should show empty state
    const emptyState = canvasElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain('No results found');
    expect(emptyState?.textContent).toContain('Try modifying your query');

    // Should NOT show grid
    const grid = canvasElement.querySelector('.wx-grid');
    expect(grid).toBeFalsy();
  },
};

export const CustomRowHeight: Story = {
  args: {
    data: dbpediaData,
    virtualScroll: false,
    rowHeight: 48,
  },
};

export const CompactRows: Story = {
  args: {
    data: dbpediaData,
    virtualScroll: false,
    rowHeight: 24,
  },
};

/**
 * IRI Abbreviation Showcase (Task 22)
 * Demonstrates automatic IRI abbreviation using prefixes from the SPARQL query:
 * - Uses PREFIX declarations from the query
 * - Abbreviates IRIs that match declared prefixes
 * - Displays full IRI when no matching prefix
 * - Supports custom namespaces defined by user
 */
export const IRIAbbreviation: Story = {
  args: {
    data: iriAbbreviationData,
    virtualScroll: false,
    rowHeight: 36,
    // Simulate prefixes from a SPARQL query like:
    // PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    // PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    // etc.
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      dbr: 'http://dbpedia.org/resource/',
      wd: 'http://www.wikidata.org/entity/',
      wdt: 'http://www.wikidata.org/prop/direct/',
      schema: 'http://schema.org/',
      dc: 'http://purl.org/dc/elements/1.1/',
      dcterms: 'http://purl.org/dc/terms/',
      skos: 'http://www.w3.org/2004/02/skos/core#',
    },
  },
  play: async ({ canvasElement }) => {
    // Verify table renders with abbreviated IRIs
    const gridContainer = canvasElement.querySelector('.data-table-container');
    expect(gridContainer).toBeTruthy();

    // Verify results count
    const resultsInfo = canvasElement.querySelector('.results-info');
    expect(resultsInfo?.textContent).toContain('6 results');
    expect(resultsInfo?.textContent).toContain('4 variables');

    // Verify grid is rendered (IRIs should be abbreviated in the grid data)
    const grid = canvasElement.querySelector('.wx-grid');
    expect(grid).toBeTruthy();

    // Note: The actual abbreviated values (e.g., "rdf:type", "foaf:Person")
    // are rendered inside wx-svelte-grid's virtual DOM. The abbreviation
    // happens via getCellDisplayValue() with abbreviateUri: true
  },
};

/**
 * Clickable IRI Links (Task 23)
 * Demonstrates clickable URIs that open in new tab:
 * - URIs are rendered as clickable links
 * - Links open in new tab with target="_blank"
 * - Security attributes: rel="noopener noreferrer"
 * - Abbreviated IRIs show as link text, full IRI in href
 * - Literals and blank nodes are NOT links
 * - Carbon Design System link styles applied
 */
export const ClickableIRILinks: Story = {
  args: {
    data: {
      columns: ['subject', 'predicate', 'object', 'description'],
      rows: [
        {
          subject: {
            value: 'http://dbpedia.org/resource/Albert_Einstein',
            type: 'uri',
            rawValue: 'http://dbpedia.org/resource/Albert_Einstein',
          },
          predicate: {
            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
            type: 'uri',
            rawValue: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          },
          object: {
            value: 'http://xmlns.com/foaf/0.1/Person',
            type: 'uri',
            rawValue: 'http://xmlns.com/foaf/0.1/Person',
          },
          description: { value: 'URIs are clickable links', type: 'literal' },
        },
        {
          subject: {
            value: 'http://www.wikidata.org/entity/Q42',
            type: 'uri',
            rawValue: 'http://www.wikidata.org/entity/Q42',
          },
          predicate: {
            value: 'http://www.w3.org/2000/01/rdf-schema#label',
            type: 'uri',
            rawValue: 'http://www.w3.org/2000/01/rdf-schema#label',
          },
          object: { value: 'Douglas Adams', type: 'literal', lang: 'en' },
          description: { value: 'Literals are NOT links', type: 'literal' },
        },
        {
          subject: { value: '_:b0', type: 'bnode', rawValue: '_:b0' },
          predicate: {
            value: 'http://xmlns.com/foaf/0.1/name',
            type: 'uri',
            rawValue: 'http://xmlns.com/foaf/0.1/name',
          },
          object: { value: 'Anonymous Person', type: 'literal' },
          description: { value: 'Blank nodes are NOT links', type: 'literal' },
        },
        {
          subject: {
            value: 'http://schema.org/Person',
            type: 'uri',
            rawValue: 'http://schema.org/Person',
          },
          predicate: {
            value: 'http://www.w3.org/2002/07/owl#equivalentClass',
            type: 'uri',
            rawValue: 'http://www.w3.org/2002/07/owl#equivalentClass',
          },
          object: {
            value: 'http://xmlns.com/foaf/0.1/Person',
            type: 'uri',
            rawValue: 'http://xmlns.com/foaf/0.1/Person',
          },
          description: { value: 'Links open in new tab (target="_blank")', type: 'literal' },
        },
        {
          subject: {
            value: 'http://purl.org/dc/terms/creator',
            type: 'uri',
            rawValue: 'http://purl.org/dc/terms/creator',
          },
          predicate: {
            value: 'http://www.w3.org/2000/01/rdf-schema#range',
            type: 'uri',
            rawValue: 'http://www.w3.org/2000/01/rdf-schema#range',
          },
          object: {
            value: 'http://xmlns.com/foaf/0.1/Agent',
            type: 'uri',
            rawValue: 'http://xmlns.com/foaf/0.1/Agent',
          },
          description: {
            value: 'Security: rel="noopener noreferrer"',
            type: 'literal',
          },
        },
      ],
      rowCount: 5,
      vars: ['subject', 'predicate', 'object', 'description'],
    },
    virtualScroll: false,
    rowHeight: 40,
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      dbr: 'http://dbpedia.org/resource/',
      wd: 'http://www.wikidata.org/entity/',
      schema: 'http://schema.org/',
      dcterms: 'http://purl.org/dc/terms/',
    },
  },
  play: async ({ canvasElement }) => {
    // Verify table renders
    const gridContainer = canvasElement.querySelector('.data-table-container');
    expect(gridContainer).toBeTruthy();

    // Verify results count
    const resultsInfo = canvasElement.querySelector('.results-info');
    expect(resultsInfo?.textContent).toContain('5 results');
    expect(resultsInfo?.textContent).toContain('4 variables');

    // Wait for grid to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify clickable links exist
    const links = canvasElement.querySelectorAll('a.uri-link');
    expect(links.length).toBeGreaterThan(0);

    // Check first link (subject in first row)
    if (links.length > 0) {
      const firstLink = links[0] as HTMLAnchorElement;

      // Should have correct attributes
      expect(firstLink.getAttribute('target')).toBe('_blank');
      expect(firstLink.getAttribute('rel')).toBe('noopener noreferrer');

      // Should have full IRI in href
      expect(firstLink.href).toContain('http');

      // Should have title attribute for tooltip
      expect(firstLink.hasAttribute('title')).toBe(true);

      // Should have uri-link class for styling
      expect(firstLink.classList.contains('uri-link')).toBe(true);
    }

    // Verify literals are NOT links
    // The description column contains only literals
    // We should not find those literal values as link hrefs
    const literalLinks = Array.from(links).filter((link) =>
      (link as HTMLAnchorElement).href.includes('Literals are NOT links')
    );
    expect(literalLinks.length).toBe(0);
  },
};
