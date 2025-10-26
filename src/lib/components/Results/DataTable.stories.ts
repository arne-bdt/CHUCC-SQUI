/**
 * DataTable Component Stories
 * Demonstrates SPARQL results table with various data scenarios
 */

import type { Meta, StoryObj } from '@storybook/svelte';
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

export const Default: Story = {
  args: {
    data: dbpediaData,
    virtualScroll: true,
    rowHeight: 32,
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
