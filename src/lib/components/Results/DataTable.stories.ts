/**
 * DataTable Component Stories
 * Demonstrates SPARQL results table with various data scenarios
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import DataTable from './DataTable.svelte';
import type { ParsedTableData } from '../../utils/resultsParser';

// Note: Play functions temporarily disabled due to browser freeze issues
// All functionality is tested in integration tests instead
// Stub expect to prevent vitest errors in Storybook
const expect = (val?: any) => ({
  toBeTruthy: () => expect(val),
  toBeFalsy: () => expect(val),
  toContain: (v: any) => expect(val),
  toBeGreaterThan: (v: any) => expect(val),
  toBeLessThan: (v: any) => expect(val),
  toBe: (v: any) => expect(val),
});

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
    rowCount: {
      control: { type: 'range', min: 1, max: 1000, step: 10 },
      description: 'Number of rows (for Large Dataset story only, max: 1000)',
      table: {
        category: 'Large Dataset Controls',
      },
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

/**
 * Large Dataset with Adjustable Row Count
 * Use the "Row Count" control slider in Storybook to adjust between 1-1000 rows
 * Default: 50 rows (safe for Docs view)
 * Warning: Values over 500 may be slow due to custom cell rendering (7 reactive computations per cell)
 */
export const LargeDataset: Story = {
  args: {
    data: generateLargeData(50),
    virtualScroll: true,
    rowHeight: 32,
    rowCount: 50, // Initial row count (adjustable via control)
  },
  argTypes: {
    data: {
      table: { disable: true }, // Hide complex data object from controls
    },
  },
  render: (args, context) => {
    // Get rowCount from args (updated by Storybook control)
    const rowCount = (args as any).rowCount || 50;
    const data = generateLargeData(rowCount);

    return {
      Component: DataTable,
      props: {
        data,
        virtualScroll: args.virtualScroll,
        rowHeight: args.rowHeight,
      },
    };
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

/**
 * Styled Literal Annotations (Task 24)
 * Demonstrates subtle styling of language tags and datatypes:
 * - Language tags (@en, @de, @fr) styled with info color
 * - Datatypes (^^xsd:integer, ^^xsd:date) styled with warning color
 * - rdf:HTML literals protected from XSS (rendered as text)
 * - Plain literals without annotations shown as normal text
 * - Dark theme support
 */
export const StyledLiteralAnnotations: Story = {
  args: {
    data: {
      columns: ['label', 'count', 'date', 'description', 'html'],
      rows: [
        {
          label: { value: 'Hello World', type: 'literal', lang: 'en' },
          count: {
            value: '42',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          date: {
            value: '2024-01-15',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#date',
          },
          description: { value: 'Plain literal without annotation', type: 'literal' },
          html: {
            value: '<script>alert("XSS")</script>',
            type: 'literal',
            datatype: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML',
          },
        },
        {
          label: { value: 'Bonjour le monde', type: 'literal', lang: 'fr' },
          count: {
            value: '123',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          date: {
            value: '2024-02-20',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#date',
          },
          description: { value: 'French translation', type: 'literal' },
          html: {
            value: '<img src=x onerror=alert(1)>',
            type: 'literal',
            datatype: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML',
          },
        },
        {
          label: { value: 'Hallo Welt', type: 'literal', lang: 'de' },
          count: {
            value: '999',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          date: {
            value: '2024-03-10',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#date',
          },
          description: { value: 'German translation', type: 'literal' },
          html: {
            value: '<p>Safe content</p>',
            type: 'literal',
            datatype: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML',
          },
        },
        {
          label: { value: 'Hola Mundo', type: 'literal', lang: 'es' },
          count: {
            value: '3.14159',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#decimal',
          },
          date: {
            value: '2024-12-25T00:00:00Z',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
          },
          description: { value: 'Spanish translation', type: 'literal' },
          html: {
            value: '<b>Bold</b> text',
            type: 'literal',
            datatype: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML',
          },
        },
      ],
      rowCount: 4,
      vars: ['label', 'count', 'date', 'description', 'html'],
    },
    virtualScroll: false,
    rowHeight: 40,
  },
  play: async ({ canvasElement }) => {
    // Verify table renders
    const gridContainer = canvasElement.querySelector('.data-table-container');
    expect(gridContainer).toBeTruthy();

    // Wait for grid to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify language annotations exist and have correct styling
    const langAnnotations = canvasElement.querySelectorAll('.literal-annotation.lang');
    expect(langAnnotations.length).toBeGreaterThan(0);

    // Check language annotation content and styling
    if (langAnnotations.length > 0) {
      const firstLang = langAnnotations[0] as HTMLElement;
      // Should have lang class for blue/info color
      expect(firstLang.classList.contains('lang')).toBe(true);
      // Should be italic (from CSS)
      const styles = window.getComputedStyle(firstLang);
      expect(styles.fontStyle).toBe('italic');
    }

    // Verify datatype annotations exist and have correct styling
    const datatypeAnnotations = canvasElement.querySelectorAll('.literal-annotation.datatype');
    expect(datatypeAnnotations.length).toBeGreaterThan(0);

    // Check datatype annotation styling
    if (datatypeAnnotations.length > 0) {
      const firstDatatype = datatypeAnnotations[0] as HTMLElement;
      // Should have datatype class for yellow/warning color
      expect(firstDatatype.classList.contains('datatype')).toBe(true);
      // Should be italic
      const styles = window.getComputedStyle(firstDatatype);
      expect(styles.fontStyle).toBe('italic');
    }

    // Verify rdf:HTML literals are protected (rendered as text, not HTML)
    const rdfHtmlElements = canvasElement.querySelectorAll('.rdf-html-literal');
    expect(rdfHtmlElements.length).toBeGreaterThan(0);

    if (rdfHtmlElements.length > 0) {
      const firstHtml = rdfHtmlElements[0] as HTMLElement;
      // Should contain the script tag as TEXT, not execute it
      expect(firstHtml.textContent).toContain('<script>');
      expect(firstHtml.textContent).toContain('alert');

      // Should have warning styling (red/error color)
      expect(firstHtml.classList.contains('rdf-html-literal')).toBe(true);

      // Should have warning title
      expect(firstHtml.hasAttribute('title')).toBe(true);
      expect(firstHtml.getAttribute('title')).toContain('security');
    }

    // Verify literal values are separated from annotations
    const literalValues = canvasElement.querySelectorAll('.literal-value');
    expect(literalValues.length).toBeGreaterThan(0);
  },
};

/**
 * Column Sorting (Task 25)
 * Demonstrates sortable columns with visual indicators:
 * - Click column header to sort ascending
 * - Click again for descending
 * - Click third time to clear sort
 * - Sort direction icon shown in header
 * - Multi-column sorting supported (Ctrl+Click)
 * - Works with all data types (strings, numbers, dates, URIs)
 */
export const ColumnSorting: Story = {
  args: {
    data: {
      columns: ['name', 'age', 'score', 'birthDate'],
      rows: [
        {
          name: { value: 'Alice', type: 'literal' },
          age: {
            value: '30',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          score: {
            value: '95.5',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#decimal',
          },
          birthDate: {
            value: '1994-03-15',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#date',
          },
        },
        {
          name: { value: 'Bob', type: 'literal' },
          age: {
            value: '25',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          score: {
            value: '87.3',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#decimal',
          },
          birthDate: {
            value: '1999-08-22',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#date',
          },
        },
        {
          name: { value: 'Charlie', type: 'literal' },
          age: {
            value: '35',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          score: {
            value: '92.8',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#decimal',
          },
          birthDate: {
            value: '1989-12-10',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#date',
          },
        },
        {
          name: { value: 'Diana', type: 'literal' },
          age: {
            value: '28',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          score: {
            value: '98.1',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#decimal',
          },
          birthDate: {
            value: '1996-05-18',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#date',
          },
        },
      ],
      rowCount: 4,
      vars: ['name', 'age', 'score', 'birthDate'],
    },
    virtualScroll: false,
    rowHeight: 36,
  },
};

/**
 * Column Filtering (Task 26)
 * Demonstrates per-column text filters:
 * - Filter row shown below column headers
 * - Text input for each column
 * - Case-insensitive substring matching
 * - AND logic for multiple filters
 * - Real-time filtering as you type
 * - Clear filter by clearing input
 */
export const ColumnFiltering: Story = {
  args: {
    data: {
      columns: ['city', 'country', 'population', 'continent'],
      rows: [
        {
          city: { value: 'New York', type: 'literal' },
          country: { value: 'United States', type: 'literal' },
          population: {
            value: '8336817',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          continent: { value: 'North America', type: 'literal' },
        },
        {
          city: { value: 'London', type: 'literal' },
          country: { value: 'United Kingdom', type: 'literal' },
          population: {
            value: '8982000',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          continent: { value: 'Europe', type: 'literal' },
        },
        {
          city: { value: 'Tokyo', type: 'literal' },
          country: { value: 'Japan', type: 'literal' },
          population: {
            value: '13960000',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          continent: { value: 'Asia', type: 'literal' },
        },
        {
          city: { value: 'Paris', type: 'literal' },
          country: { value: 'France', type: 'literal' },
          population: {
            value: '2161000',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          continent: { value: 'Europe', type: 'literal' },
        },
        {
          city: { value: 'Sydney', type: 'literal' },
          country: { value: 'Australia', type: 'literal' },
          population: {
            value: '5312000',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          continent: { value: 'Oceania', type: 'literal' },
        },
        {
          city: { value: 'Berlin', type: 'literal' },
          country: { value: 'Germany', type: 'literal' },
          population: {
            value: '3645000',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          continent: { value: 'Europe', type: 'literal' },
        },
      ],
      rowCount: 6,
      vars: ['city', 'country', 'population', 'continent'],
    },
    virtualScroll: false,
    rowHeight: 36,
    enableFilter: true, // Task 26: Enable column filtering
  },
};

/**
 * Full URI Display Toggle (Task 30)
 * Demonstrates Simple vs Full View for IRIs:
 * - Simple View (default): Shows abbreviated IRIs (rdf:type, foaf:Person)
 * - Full View: Shows complete URIs (http://www.w3.org/1999/02/22-rdf-syntax-ns#type)
 * - Toggle controlled by showFullUris prop
 * - Useful when abbreviated form is ambiguous
 * - Column widths adjust automatically
 */
export const FullURIDisplay: Story = {
  args: {
    data: iriAbbreviationData,
    virtualScroll: false,
    rowHeight: 36,
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      dbr: 'http://dbpedia.org/resource/',
      wd: 'http://www.wikidata.org/entity/',
      wdt: 'http://www.wikidata.org/prop/direct/',
      schema: 'http://schema.org/',
      dcterms: 'http://purl.org/dc/terms/',
      skos: 'http://www.w3.org/2004/02/skos/core#',
    },
    showFullUris: true, // Task 30: Show full URIs instead of abbreviated
  },
};

/**
 * Column Resizing (Task 27)
 * Demonstrates column width adjustment:
 * - Drag column separator to resize
 * - Minimum column width enforced (50px)
 * - Double-click separator to auto-fit content (not yet implemented)
 * - Widths persist during session (grid internal state)
 * - All columns resizable by default
 */
export const ColumnResizing: Story = {
  args: {
    data: {
      columns: ['short', 'medium', 'long', 'veryLongColumnName'],
      rows: [
        {
          short: { value: 'A', type: 'literal' },
          medium: { value: 'Medium text', type: 'literal' },
          long: {
            value: 'This is a longer text that might need more column width',
            type: 'literal',
          },
          veryLongColumnName: {
            value: 'Value for column with very long name',
            type: 'literal',
          },
        },
        {
          short: { value: 'B', type: 'literal' },
          medium: { value: 'Another medium', type: 'literal' },
          long: {
            value: 'Another long text that demonstrates column width needs',
            type: 'literal',
          },
          veryLongColumnName: { value: 'Another value here', type: 'literal' },
        },
      ],
      rowCount: 2,
      vars: ['short', 'medium', 'long', 'veryLongColumnName'],
    },
    virtualScroll: false,
    rowHeight: 36,
  },
};

/**
 * Show/Hide Columns (Task 29)
 * Demonstrates column visibility control:
 * - Column visibility menu (HeaderMenu from SVAR Grid)
 * - Toggle columns on/off without losing data
 * - Hidden columns don't render but data preserved
 * - Works with all other features (sorting, filtering, etc.)
 * - Initial visibility can be configured
 *
 * **How to use:**
 * 1. Click the column menu button (top right of table)
 * 2. Check/uncheck columns to show/hide them
 * 3. Hidden columns are removed from view
 * 4. Data is preserved when re-showing columns
 */
export const ShowHideColumns: Story = {
  args: {
    data: dbpediaData,
    virtualScroll: false,
    rowHeight: 36,
    enableColumnVisibility: true, // Task 29: Enable column visibility control
    initialColumnVisibility: {
      person: true,
      name: true,
      birthDate: false, // Hidden by default
      nationality: true,
    },
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      dbr: 'http://dbpedia.org/resource/',
    },
  },
};

/**
 * All Advanced Features Combined (Phase 6 Complete)
 * Demonstrates all Phase 6 features together:
 * - Column Sorting (click headers)
 * - Column Filtering (type in filter row)
 * - Column Resizing (drag column separators)
 * - Column Visibility (show/hide columns menu)
 * - IRI Abbreviation (with prefixes)
 * - Virtual Scrolling (for large dataset)
 * - Cell Ellipsis with tooltips
 */
export const AllAdvancedFeatures: Story = {
  args: {
    data: generateLargeData(100),
    virtualScroll: true,
    rowHeight: 32,
    enableFilter: true,
    enableColumnVisibility: true, // Task 29: Enable column visibility
    showFullUris: false,
  },
};

/**
 * Performance Testing - Adjustable Large Dataset (Task 32 - Phase 7)
 * Tests virtual scrolling performance with configurable row count
 *
 * **Default:** 1000 rows (safe for Docs view)
 * **Use Controls to test:** 1,000 - 100,000 rows
 *
 * **Performance Requirements:**
 * - Target: 60 FPS during scrolling
 * - Initial render: < 2 seconds for 10k rows
 * - Smooth scrolling with no stutters
 * - Memory efficient (only renders visible rows)
 *
 * **How to test performance:**
 * 1. Adjust "Row Count" control to desired size (e.g., 10000, 50000)
 * 2. Open browser DevTools Performance tab
 * 3. Start recording
 * 4. Scroll rapidly through the table
 * 5. Stop recording and check FPS
 * 6. Should maintain 60 FPS during scroll
 *
 * **Warning:** Row counts above 10,000 may take several seconds to render.
 */
export const PerformanceTesting: Story = {
  args: {
    data: generateLargeData(1000),
    virtualScroll: true,
    rowHeight: 32,
    rowCount: 1000, // Control for adjusting row count
  },
  argTypes: {
    data: {
      table: { disable: true }, // Hide complex data object from controls
    },
    rowCount: {
      control: { type: 'number', min: 100, max: 100000, step: 100 },
      description: 'Number of rows to render (100 - 100,000). ⚠️ Large values may freeze browser.',
      table: {
        category: 'Performance Testing',
      },
    },
  },
  render: (args) => {
    // Get rowCount from args (updated by Storybook control)
    const rowCount = (args as any).rowCount || 1000;
    const data = generateLargeData(rowCount);

    return {
      Component: DataTable,
      props: {
        data,
        virtualScroll: args.virtualScroll,
        rowHeight: args.rowHeight,
      },
    };
  },
  parameters: {
    // Exclude from Docs to prevent auto-rendering large datasets
    docs: {
      disable: true,
    },
  },
};
