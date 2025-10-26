/**
 * Performance Benchmarks for DataTable Component
 * Tests rendering performance with various dataset sizes
 *
 * Run with: npm run bench
 * Or: npx vitest bench
 */

import { bench, describe } from 'vitest';
import { render } from '@testing-library/svelte';
import DataTable from '../../src/lib/components/Results/DataTable.svelte';
import type { ParsedTableData } from '../../src/lib/utils/resultsParser';

// Generate test data of various sizes
function generateData(rows: number): ParsedTableData {
  const data: ParsedTableData = {
    columns: ['id', 'name', 'value', 'category'],
    rows: [],
    rowCount: rows,
    vars: ['id', 'name', 'value', 'category'],
  };

  for (let i = 0; i < rows; i++) {
    data.rows.push({
      id: { value: String(i), type: 'literal' },
      name: { value: `Item ${i}`, type: 'literal' },
      value: { value: String(Math.random() * 1000), type: 'literal' },
      category: { value: `Category ${i % 10}`, type: 'literal' },
    });
  }

  return data;
}

describe('DataTable Rendering Performance', () => {
  bench('Render 100 rows', () => {
    const data = generateData(100);
    render(DataTable, { props: { data, virtualScroll: false } });
  });

  bench('Render 1,000 rows', () => {
    const data = generateData(1000);
    render(DataTable, { props: { data, virtualScroll: true } });
  });

  bench('Render 10,000 rows with virtual scrolling', () => {
    const data = generateData(10000);
    render(DataTable, { props: { data, virtualScroll: true } });
  });

  bench('Render 10,000 rows WITHOUT virtual scrolling (baseline)', () => {
    const data = generateData(10000);
    render(DataTable, { props: { data, virtualScroll: false } });
  });
});

describe('DataTable Data Processing Performance', () => {
  bench('Process 100 rows with complex cells', () => {
    const data: ParsedTableData = {
      columns: ['uri', 'label', 'description', 'date'],
      rows: [],
      rowCount: 100,
      vars: ['uri', 'label', 'description', 'date'],
    };

    for (let i = 0; i < 100; i++) {
      data.rows.push({
        uri: {
          value: `http://example.org/resource/${i}`,
          type: 'uri',
          rawValue: `http://example.org/resource/${i}`,
        },
        label: {
          value: `Label ${i}`,
          type: 'literal',
          lang: 'en',
        },
        description: {
          value: `Description ${i}`,
          type: 'literal',
          lang: 'en',
        },
        date: {
          value: '2024-01-01',
          type: 'literal',
          datatype: 'http://www.w3.org/2001/XMLSchema#date',
        },
      });
    }

    render(DataTable, { props: { data, virtualScroll: false } });
  });

  bench('Process 1,000 rows with language tags', () => {
    const data: ParsedTableData = {
      columns: ['item', 'labelEN', 'labelDE', 'labelFR'],
      rows: [],
      rowCount: 1000,
      vars: ['item', 'labelEN', 'labelDE', 'labelFR'],
    };

    for (let i = 0; i < 1000; i++) {
      data.rows.push({
        item: { value: `http://example.org/item/${i}`, type: 'uri' },
        labelEN: { value: `Label ${i}`, type: 'literal', lang: 'en' },
        labelDE: { value: `Bezeichnung ${i}`, type: 'literal', lang: 'de' },
        labelFR: { value: `Étiquette ${i}`, type: 'literal', lang: 'fr' },
      });
    }

    render(DataTable, { props: { data, virtualScroll: true } });
  });
});

describe('DataTable Virtual Scrolling Performance', () => {
  bench('Virtual scroll: 10,000 rows @ 32px height', () => {
    const data = generateData(10000);
    render(DataTable, { props: { data, virtualScroll: true, rowHeight: 32 } });
  });

  bench('Virtual scroll: 10,000 rows @ 48px height', () => {
    const data = generateData(10000);
    render(DataTable, { props: { data, virtualScroll: true, rowHeight: 48 } });
  });

  bench('Virtual scroll: 10,000 rows @ 24px height (compact)', () => {
    const data = generateData(10000);
    render(DataTable, { props: { data, virtualScroll: true, rowHeight: 24 } });
  });
});
