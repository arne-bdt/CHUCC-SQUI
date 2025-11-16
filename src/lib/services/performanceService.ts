/**
 * Performance profiling service for SPARQL query execution
 * Tracks timing, memory, and data size metrics for queries
 */

import { logPerformance } from '../utils/logger';

/**
 * Memory information from performance.memory API (non-standard but widely supported)
 */
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

/**
 * Performance metrics for a single query execution
 */
export interface QueryPerformanceMetrics {
  // Timing (in milliseconds)
  networkTime: number; // Time to first byte
  downloadTime: number; // Time to receive full response
  parseTime: number; // Time to parse response
  renderTime: number; // Time to render results
  totalTime: number; // End-to-end time

  // Data size
  responseBytes: number; // Response size in bytes
  rowCount: number; // Number of result rows
  columnCount: number; // Number of columns

  // Memory (if available)
  peakMemoryMB?: number; // Peak memory usage
  memoryGrowthMB?: number; // Memory growth

  // Metadata
  endpoint: string; // Which endpoint
  format: string; // json, csv, tsv, etc.
  queryType: string; // SELECT, ASK, etc.
  timestamp: Date; // When executed
}

/**
 * Aggregated performance statistics
 */
export interface PerformanceStats {
  count: number;
  totalTime: {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
  };
  parseTime: {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
  };
  networkTime: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  rowCount: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  memoryUsageMB?: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
}

/**
 * Helper class to collect metrics for a single query
 */
class PerformanceProfiler {
  private startTime = performance.now();
  private firstByteTime?: number;
  private downloadCompleteTime?: number;
  private parseCompleteTime?: number;
  private initialMemory = this.getMemoryUsage();

  /**
   * Mark when first byte is received from server
   */
  markFirstByte(): void {
    this.firstByteTime = performance.now();
  }

  /**
   * Mark when download is complete
   */
  markDownloadComplete(): void {
    this.downloadCompleteTime = performance.now();
  }

  /**
   * Mark when parsing is complete
   */
  markParseComplete(): void {
    this.parseCompleteTime = performance.now();
  }

  /**
   * Complete profiling and return metrics
   */
  complete(result: {
    responseBytes: number;
    rowCount: number;
    columnCount: number;
    endpoint: string;
    format: string;
    queryType: string;
  }): QueryPerformanceMetrics {
    const now = performance.now();
    const finalMemory = this.getMemoryUsage();

    return {
      networkTime: (this.firstByteTime || now) - this.startTime,
      downloadTime:
        (this.downloadCompleteTime || now) - (this.firstByteTime || this.startTime),
      parseTime: (this.parseCompleteTime || now) - (this.downloadCompleteTime || this.startTime),
      renderTime: now - (this.parseCompleteTime || this.startTime),
      totalTime: now - this.startTime,
      peakMemoryMB: finalMemory?.usedJSHeapSize
        ? finalMemory.usedJSHeapSize / 1024 / 1024
        : undefined,
      memoryGrowthMB:
        finalMemory && this.initialMemory
          ? (finalMemory.usedJSHeapSize - this.initialMemory.usedJSHeapSize) / 1024 / 1024
          : undefined,
      ...result,
      timestamp: new Date(),
    };
  }

  /**
   * Get current memory usage (if available)
   */
  private getMemoryUsage(): MemoryInfo | undefined {
    // performance.memory is non-standard but widely supported in Chrome/Edge
    const perf = performance as Performance & { memory?: MemoryInfo };
    return perf.memory;
  }
}

/**
 * Performance profiling service configuration
 */
export interface PerformanceServiceConfig {
  /** Enable console logging of metrics (default: false in tests, true otherwise) */
  enableLogging?: boolean;
  /** Maximum number of metrics to store (default: 100) */
  maxStoredMetrics?: number;
}

/**
 * Performance profiling service
 * Tracks query execution metrics and provides analytics
 */
export class PerformanceService {
  private metrics: QueryPerformanceMetrics[] = [];
  private maxStoredMetrics: number;
  private enableLogging: boolean;

  constructor(config: PerformanceServiceConfig = {}) {
    this.maxStoredMetrics = config.maxStoredMetrics ?? 100;
    // Default: disable logging in test environments, enable otherwise
    this.enableLogging = config.enableLogging ?? this.shouldEnableLogging();
  }

  /**
   * Enable or disable console logging
   */
  setLoggingEnabled(enabled: boolean): void {
    this.enableLogging = enabled;
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return this.enableLogging;
  }

  /**
   * Start profiling a query execution
   */
  startProfiling(): PerformanceProfiler {
    return new PerformanceProfiler();
  }

  /**
   * Record completed metrics
   */
  recordMetrics(metrics: QueryPerformanceMetrics): void {
    this.metrics.push(metrics);

    // Keep only last N metrics to avoid memory bloat
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics.shift();
    }

    if (this.enableLogging) {
      this.logMetrics(metrics);
    }
  }

  /**
   * Determine if logging should be enabled by default
   * Disabled in test environments to avoid polluting test output
   */
  private shouldEnableLogging(): boolean {
    // Check common test environment indicators
    if (typeof process !== 'undefined' && process.env) {
      // Vitest sets NODE_ENV to 'test'
      if (process.env.NODE_ENV === 'test') return false;
      // Jest sets JEST_WORKER_ID
      if (process.env.JEST_WORKER_ID !== undefined) return false;
      // Vitest sets VITEST
      if (process.env.VITEST !== undefined) return false;
    }

    // Default to enabled for development and production
    return true;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): QueryPerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get aggregated statistics
   */
  getStats(): PerformanceStats | null {
    if (this.metrics.length === 0) {
      return null;
    }

    return {
      count: this.metrics.length,
      totalTime: this.calculateStats(this.metrics.map((m) => m.totalTime)),
      parseTime: this.calculateStats(this.metrics.map((m) => m.parseTime)),
      networkTime: this.calculateBasicStats(this.metrics.map((m) => m.networkTime)),
      rowCount: this.calculateBasicStats(this.metrics.map((m) => m.rowCount)),
      memoryUsageMB: this.calculateMemoryStats(),
    };
  }

  /**
   * Export metrics as CSV for analysis
   */
  exportMetrics(): string {
    const headers = [
      'timestamp',
      'endpoint',
      'format',
      'queryType',
      'totalTime',
      'networkTime',
      'downloadTime',
      'parseTime',
      'renderTime',
      'responseBytes',
      'rowCount',
      'columnCount',
      'peakMemoryMB',
      'memoryGrowthMB',
    ];

    const rows = this.metrics.map((m) => [
      m.timestamp.toISOString(),
      m.endpoint,
      m.format,
      m.queryType,
      m.totalTime.toFixed(2),
      m.networkTime.toFixed(2),
      m.downloadTime.toFixed(2),
      m.parseTime.toFixed(2),
      m.renderTime.toFixed(2),
      m.responseBytes.toString(),
      m.rowCount.toString(),
      m.columnCount.toString(),
      m.peakMemoryMB?.toFixed(2) || '',
      m.memoryGrowthMB?.toFixed(2) || '',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Log metrics to console
   */
  private logMetrics(metrics: QueryPerformanceMetrics): void {
    const metricsData: Record<string, unknown> = {
      'Total time': `${metrics.totalTime.toFixed(2)} ms`,
      'Network': `${metrics.networkTime.toFixed(2)} ms`,
      'Download': `${metrics.downloadTime.toFixed(2)} ms`,
      'Parse': `${metrics.parseTime.toFixed(2)} ms`,
      'Render': `${metrics.renderTime.toFixed(2)} ms`,
      'Response': this.formatBytes(metrics.responseBytes),
      'Results': `${metrics.rowCount} rows × ${metrics.columnCount} cols`,
    };

    if (metrics.peakMemoryMB !== undefined) {
      metricsData['Memory peak'] = `${metrics.peakMemoryMB.toFixed(1)} MB`;
      if (metrics.memoryGrowthMB !== undefined) {
        metricsData['Memory growth'] = `${metrics.memoryGrowthMB > 0 ? '+' : ''}${metrics.memoryGrowthMB.toFixed(1)} MB`;
      }
    }

    logPerformance('Query Performance', metricsData);
  }

  /**
   * Calculate comprehensive statistics for a metric
   */
  private calculateStats(values: number[]): {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
  } {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      median: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    };
  }

  /**
   * Calculate basic statistics for a metric (no percentiles)
   */
  private calculateBasicStats(values: number[]): {
    min: number;
    max: number;
    avg: number;
    median: number;
  } {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      median: this.percentile(sorted, 50),
    };
  }

  /**
   * Calculate memory statistics (if available)
   */
  private calculateMemoryStats():
    | {
        min: number;
        max: number;
        avg: number;
        median: number;
      }
    | undefined {
    const memoryValues = this.metrics
      .map((m) => m.peakMemoryMB)
      .filter((m): m is number => m !== undefined);

    if (memoryValues.length === 0) {
      return undefined;
    }

    return this.calculateBasicStats(memoryValues);
  }

  /**
   * Calculate percentile value from sorted array
   */
  private percentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sortedValues[lower];
    }

    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  /**
   * Format bytes for human readability
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
}

/**
 * Singleton instance of the performance service
 */
export const performanceService = new PerformanceService();
