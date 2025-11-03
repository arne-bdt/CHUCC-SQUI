/**
 * Storybook stories for PerformancePanel component
 *
 * Note: Performance logging is automatically disabled in test environments.
 * To enable console logging of metrics during development:
 *
 * ```typescript
 * import { performanceService } from '$lib/services/performanceService';
 * performanceService.setLoggingEnabled(true);
 * ```
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import PerformancePanel from './PerformancePanel.svelte';
import { performanceService } from '$lib/services/performanceService';

const meta = {
  title: 'Debug/PerformancePanel',
  component: PerformancePanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<PerformancePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - no metrics recorded yet
 */
export const EmptyState: Story = {
  args: {},
  play: async () => {
    // Clear any existing metrics
    performanceService.clearMetrics();
  },
};

/**
 * With sample metrics - simulates a few queries
 */
export const WithSampleMetrics: Story = {
  args: {},
  play: async () => {
    // Clear existing metrics
    performanceService.clearMetrics();

    // Add sample metrics
    const now = Date.now();

    performanceService.recordMetrics({
      networkTime: 120,
      downloadTime: 250,
      parseTime: 45,
      renderTime: 25,
      totalTime: 440,
      responseBytes: 2048,
      rowCount: 25,
      columnCount: 4,
      endpoint: 'https://dbpedia.org/sparql',
      format: 'json',
      queryType: 'SELECT',
      timestamp: new Date(now - 10000),
      peakMemoryMB: 42.5,
      memoryGrowthMB: 5.2,
    });

    performanceService.recordMetrics({
      networkTime: 85,
      downloadTime: 180,
      parseTime: 32,
      renderTime: 18,
      totalTime: 315,
      responseBytes: 1536,
      rowCount: 50,
      columnCount: 5,
      endpoint: 'https://query.wikidata.org/sparql',
      format: 'json',
      queryType: 'SELECT',
      timestamp: new Date(now - 5000),
      peakMemoryMB: 38.2,
      memoryGrowthMB: 3.8,
    });

    performanceService.recordMetrics({
      networkTime: 200,
      downloadTime: 450,
      parseTime: 120,
      renderTime: 65,
      totalTime: 835,
      responseBytes: 8192,
      rowCount: 1000,
      columnCount: 8,
      endpoint: 'https://dbpedia.org/sparql',
      format: 'json',
      queryType: 'SELECT',
      timestamp: new Date(now),
      peakMemoryMB: 68.5,
      memoryGrowthMB: 15.3,
    });
  },
};

/**
 * With many metrics - simulates extensive use
 */
export const WithManyMetrics: Story = {
  args: {},
  play: async () => {
    // Clear existing metrics
    performanceService.clearMetrics();

    // Add 20 sample metrics with varying characteristics
    const endpoints = [
      'https://dbpedia.org/sparql',
      'https://query.wikidata.org/sparql',
      'https://sparql.example.org/query',
    ];

    const queryTypes = ['SELECT', 'ASK', 'CONSTRUCT'];
    const formats = ['json', 'csv', 'tsv'];

    for (let i = 0; i < 20; i++) {
      const networkTime = 50 + Math.random() * 200;
      const downloadTime = 100 + Math.random() * 400;
      const parseTime = 20 + Math.random() * 150;
      const renderTime = 10 + Math.random() * 80;

      performanceService.recordMetrics({
        networkTime,
        downloadTime,
        parseTime,
        renderTime,
        totalTime: networkTime + downloadTime + parseTime + renderTime,
        responseBytes: Math.floor(1024 + Math.random() * 10240),
        rowCount: Math.floor(10 + Math.random() * 2000),
        columnCount: Math.floor(3 + Math.random() * 10),
        endpoint: endpoints[i % endpoints.length],
        format: formats[i % formats.length] as 'json' | 'csv' | 'tsv',
        queryType: queryTypes[i % queryTypes.length],
        timestamp: new Date(Date.now() - (20 - i) * 2000),
        peakMemoryMB: 30 + Math.random() * 50,
        memoryGrowthMB: Math.random() * 20,
      });
    }
  },
};

/**
 * Large dataset performance - simulates heavy query
 */
export const LargeDataset: Story = {
  args: {},
  play: async () => {
    // Clear existing metrics
    performanceService.clearMetrics();

    // Add metrics for a large query
    performanceService.recordMetrics({
      networkTime: 450,
      downloadTime: 2500,
      parseTime: 850,
      renderTime: 320,
      totalTime: 4120,
      responseBytes: 1024 * 1024 * 5, // 5MB
      rowCount: 50000,
      columnCount: 12,
      endpoint: 'https://dbpedia.org/sparql',
      format: 'json',
      queryType: 'SELECT',
      timestamp: new Date(),
      peakMemoryMB: 185.5,
      memoryGrowthMB: 95.2,
    });
  },
};

/**
 * CSV format queries
 */
export const CsvFormatQueries: Story = {
  args: {},
  play: async () => {
    // Clear existing metrics
    performanceService.clearMetrics();

    // Add CSV format metrics
    performanceService.recordMetrics({
      networkTime: 95,
      downloadTime: 220,
      parseTime: 15, // CSV parsing is typically faster
      renderTime: 30,
      totalTime: 360,
      responseBytes: 3072,
      rowCount: 100,
      columnCount: 6,
      endpoint: 'https://dbpedia.org/sparql',
      format: 'csv',
      queryType: 'SELECT',
      timestamp: new Date(Date.now() - 3000),
      peakMemoryMB: 28.5,
      memoryGrowthMB: 2.1,
    });

    performanceService.recordMetrics({
      networkTime: 110,
      downloadTime: 280,
      parseTime: 18,
      renderTime: 35,
      totalTime: 443,
      responseBytes: 4096,
      rowCount: 150,
      columnCount: 7,
      endpoint: 'https://query.wikidata.org/sparql',
      format: 'csv',
      queryType: 'SELECT',
      timestamp: new Date(),
      peakMemoryMB: 32.8,
      memoryGrowthMB: 3.5,
    });
  },
};

/**
 * Without memory metrics - browser doesn't support performance.memory
 */
export const WithoutMemoryMetrics: Story = {
  args: {},
  play: async () => {
    // Clear existing metrics
    performanceService.clearMetrics();

    // Add metrics without memory data
    performanceService.recordMetrics({
      networkTime: 120,
      downloadTime: 250,
      parseTime: 45,
      renderTime: 25,
      totalTime: 440,
      responseBytes: 2048,
      rowCount: 25,
      columnCount: 4,
      endpoint: 'https://dbpedia.org/sparql',
      format: 'json',
      queryType: 'SELECT',
      timestamp: new Date(),
      // No memory metrics
    });
  },
};
