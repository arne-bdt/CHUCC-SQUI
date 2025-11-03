# Task: Performance Profiling Utilities

**Status**: Not Started
**Priority**: High (prerequisite for other optimizations)
**Estimated Effort**: 4-6 hours
**Dependencies**: None

## Objective

Create performance profiling utilities to measure actual bottlenecks in SPARQL query execution, result parsing, and rendering. This will provide evidence-based insights to guide optimization efforts.

## Why This Matters

Before implementing streaming, non-blocking parsing, or other optimizations, we need to **measure actual performance** to:
- Identify real bottlenecks (not assumed ones)
- Understand 95th percentile use cases
- Validate that optimizations actually help
- Avoid premature optimization

## Requirements

### 1. Query Execution Profiling

Measure and log:
- ⏱️ **Network time**: Time from fetch() start to first byte received
- ⏱️ **Download time**: Time to receive full response body
- ⏱️ **Parse time**: Time to parse response (JSON.parse(), CSV parsing, etc.)
- ⏱️ **Total time**: End-to-end query execution time
- 📊 **Response size**: Bytes received (compressed vs uncompressed)
- 📊 **Row count**: Number of result rows
- 📊 **Column count**: Number of variables

### 2. Memory Profiling

Track:
- 💾 **Peak memory usage**: During parsing and rendering
- 💾 **Memory growth**: Before/after query execution
- 💾 **Memory per row**: Estimate memory footprint
- 💾 **GC pressure**: Garbage collection events during parsing

### 3. Rendering Profiling

Measure:
- 🖥️ **First paint**: Time to show first result row
- 🖥️ **Full render**: Time to render all visible rows
- 🖥️ **Scroll performance**: FPS during scrolling
- 🖥️ **Interaction latency**: Time to respond to user input

### 4. User-Facing Metrics

Track perceived performance:
- ⏳ **Time to first feedback**: When does user see progress?
- ⏳ **Time to interactive**: When can user interact with results?
- ⏳ **95th percentile**: What's the typical "slow" query?

## Implementation Plan

### Step 1: Create Performance Service

**File**: `src/lib/services/performanceService.ts`

```typescript
/**
 * Performance profiling service for SPARQL query execution
 */
export interface QueryPerformanceMetrics {
  // Timing
  networkTime: number;        // Time to first byte
  downloadTime: number;       // Time to receive full response
  parseTime: number;          // Time to parse response
  renderTime: number;         // Time to render results
  totalTime: number;          // End-to-end time

  // Data size
  responseBytes: number;      // Response size in bytes
  rowCount: number;           // Number of result rows
  columnCount: number;        // Number of columns

  // Memory (if available)
  peakMemoryMB?: number;      // Peak memory usage
  memoryGrowthMB?: number;    // Memory growth

  // Metadata
  endpoint: string;           // Which endpoint
  format: string;             // json, csv, tsv, etc.
  queryType: string;          // SELECT, ASK, etc.
  timestamp: Date;            // When executed
}

export class PerformanceService {
  private metrics: QueryPerformanceMetrics[] = [];

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
    this.logMetrics(metrics);
  }

  /**
   * Get aggregated statistics
   */
  getStats(): PerformanceStats {
    // Calculate p50, p95, p99, avg, etc.
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    // CSV format for analysis
  }

  private logMetrics(metrics: QueryPerformanceMetrics): void {
    console.group('🔬 Query Performance');
    console.log('⏱️  Total time:', metrics.totalTime, 'ms');
    console.log('   Network:', metrics.networkTime, 'ms');
    console.log('   Download:', metrics.downloadTime, 'ms');
    console.log('   Parse:', metrics.parseTime, 'ms');
    console.log('   Render:', metrics.renderTime, 'ms');
    console.log('📊 Response:', metrics.responseBytes, 'bytes');
    console.log('📊 Results:', metrics.rowCount, 'rows ×', metrics.columnCount, 'cols');
    if (metrics.peakMemoryMB) {
      console.log('💾 Memory:', metrics.peakMemoryMB.toFixed(1), 'MB peak');
    }
    console.groupEnd();
  }
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

  markFirstByte(): void {
    this.firstByteTime = performance.now();
  }

  markDownloadComplete(): void {
    this.downloadCompleteTime = performance.now();
  }

  markParseComplete(): void {
    this.parseCompleteTime = performance.now();
  }

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
      downloadTime: (this.downloadCompleteTime || now) - (this.firstByteTime || this.startTime),
      parseTime: (this.parseCompleteTime || now) - (this.downloadCompleteTime || this.startTime),
      renderTime: now - (this.parseCompleteTime || this.startTime),
      totalTime: now - this.startTime,
      peakMemoryMB: finalMemory?.usedJSHeapSize ? finalMemory.usedJSHeapSize / 1024 / 1024 : undefined,
      memoryGrowthMB: finalMemory && this.initialMemory
        ? (finalMemory.usedJSHeapSize - this.initialMemory.usedJSHeapSize) / 1024 / 1024
        : undefined,
      ...result,
      timestamp: new Date(),
    };
  }

  private getMemoryUsage(): MemoryInfo | undefined {
    // @ts-expect-error - performance.memory is non-standard but widely supported
    return performance.memory as MemoryInfo | undefined;
  }
}

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

export const performanceService = new PerformanceService();
```

### Step 2: Integrate with SparqlService

**File**: `src/lib/services/sparqlService.ts`

Add profiling hooks:
- Before fetch(): `profiler.markFirstByte()` (in fetch callback)
- After response.body received: `profiler.markDownloadComplete()`
- After JSON.parse(): `profiler.markParseComplete()`
- After grid renders: `profiler.complete()`

### Step 3: Add Performance Panel to Dev Tools

**File**: `src/lib/components/debug/PerformancePanel.svelte`

Show:
- Recent query metrics (table)
- Aggregated statistics (p50, p95, p99)
- Memory usage chart
- Export button for CSV download

**Integration**: Add to existing debug panel or create new tab

### Step 4: Create Benchmark Queries

**File**: `tests/fixtures/benchmarkQueries.ts`

Test queries with various characteristics:
- Small result (< 100 rows)
- Medium result (1k-10k rows)
- Large result (50k+ rows)
- Wide result (many columns)
- Different formats (JSON, CSV, TSV)

**Endpoints**:
- DBpedia: `https://dbpedia.org/sparql`
- Wikidata: `https://query.wikidata.org/sparql`
- Local test endpoint (mock server)

### Step 5: Create Performance Test Suite

**File**: `tests/performance/queryPerformance.test.ts`

Automated tests to:
- Run benchmark queries
- Record metrics
- Assert performance budgets
- Generate performance report

**Example test**:
```typescript
test('Large result query completes within budget', async () => {
  const profiler = performanceService.startProfiling();

  // Execute query that returns 10k rows
  const result = await executeQuery({
    endpoint: BENCHMARK_ENDPOINT,
    query: LARGE_RESULT_QUERY,
  });

  const metrics = profiler.complete({
    responseBytes: result.raw.length,
    rowCount: result.data.results.bindings.length,
    columnCount: result.data.head.vars.length,
    endpoint: BENCHMARK_ENDPOINT,
    format: 'json',
    queryType: 'SELECT',
  });

  // Performance budgets
  expect(metrics.totalTime).toBeLessThan(5000); // 5s max
  expect(metrics.parseTime).toBeLessThan(1000); // 1s max parse time
  if (metrics.peakMemoryMB) {
    expect(metrics.peakMemoryMB).toBeLessThan(200); // 200 MB max
  }
});
```

## Testing Requirements

### Unit Tests
- `performanceService.test.ts` - Test metric collection and aggregation
- Test timer accuracy
- Test memory measurement (when available)

### Integration Tests
- Test profiling with real queries
- Verify metrics are recorded correctly
- Test export functionality

### Manual Testing
1. Execute various queries (small, medium, large)
2. Review performance logs in console
3. Check performance panel UI
4. Export and analyze metrics CSV
5. Compare performance across formats (JSON vs CSV/TSV)

## Documentation

Add to docs:
- How to enable performance profiling
- How to interpret metrics
- Performance budgets for different query sizes
- Known bottlenecks and recommendations

## Acceptance Criteria

✅ Performance service implemented with timing and memory tracking
✅ Profiling integrated into query execution flow
✅ Performance panel UI shows metrics
✅ Benchmark queries defined for testing
✅ Performance test suite runs automatically
✅ Documentation updated with profiling guide
✅ Metrics can be exported for analysis

## Future Enhancements

- 📊 Chart performance trends over time
- 🎯 User-configurable performance budgets
- 🔔 Warn before executing queries likely to be slow
- 📈 Compare performance across endpoints
- 🔍 Detailed flame graphs for parsing
- 💾 IndexedDB for persistent metrics storage

## Related Tasks

This task is a prerequisite for:
- STREAMING-02: Progressive UI Feedback (needs metrics to show)
- STREAMING-04: CSV/TSV Streaming (validate performance gain)
- STREAMING-05: Non-blocking Parsing (validate benefit)
