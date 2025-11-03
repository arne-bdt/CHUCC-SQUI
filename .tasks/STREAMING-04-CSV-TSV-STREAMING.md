# Task: CSV/TSV Streaming Support

**Status**: Not Started
**Priority**: Medium (real performance benefit)
**Estimated Effort**: 6-8 hours
**Dependencies**: STREAMING-01 (Performance Profiling) - recommended to validate benefit

## Objective

Implement true streaming support for CSV/TSV result formats, enabling progressive parsing and rendering of results as they arrive from the endpoint. This provides memory-efficient handling of large result sets.
Keep supporting the non-streaming JSON format. 

## Why This Matters

**Current approach** (JSON):
- Wait for complete response
- Parse entire JSON at once
- High memory usage for large results
- Blocking parse operation

**CSV/TSV streaming**:
- Parse line-by-line as data arrives
- Low memory footprint (only current line in memory)
- Progressive rendering (show rows as parsed)
- Non-blocking (can cancel mid-stream)

**Performance benefit**:
- 📉 **Memory**: ~90% reduction for large datasets
- ⚡ **First row**: Show in < 100ms vs waiting for full download
- 🎯 **Perceived speed**: Users see results immediately
- 🚫 **Cancellable**: Stop download mid-stream

## Evidence

Research findings (from STREAMING-00-ANALYSIS.md):
- TSV faster than CSV (no escape syntax, optimized newline search)
- TSV preserves RDF type info (literals, URIs, datatypes)
- CSV is lossy (just strings, no type info)
- Both naturally streamable (line-oriented)

## Requirements

### 1. Streaming CSV/TSV Parser

Support incremental parsing:

```typescript
interface StreamingParser {
  // Feed chunks of data
  feed(chunk: string): ParsedRow[];

  // Signal end of stream
  end(): ParsedRow[];

  // Get parsing errors
  getErrors(): ParsingError[];
}
```

**Features**:
- ✅ Handle chunk boundaries mid-line
- ✅ Parse TSV with RDF type preservation
- ✅ Parse CSV (lossy mode)
- ✅ Handle escaped characters
- ✅ Detect column headers
- ✅ Error recovery

### 2. Format Negotiation

Prefer CSV/TSV for large results:

**Smart format selection**:
- Small results (< 1k rows): JSON (rich metadata)
- Medium results (1k-10k): JSON or TSV
- Large results (> 10k): TSV preferred
- User can override preference

**Accept header priority**:
```
Accept: text/tab-separated-values;q=1.0,
        application/sparql-results+json;q=0.9,
        text/csv;q=0.8
```

### 3. Progressive Rendering

Update UI as rows arrive:

```typescript
interface ProgressiveRenderOptions {
  batchSize: number;      // Rows per render batch (default: 100)
  maxBuffered: number;    // Max rows to buffer before rendering (default: 1000)
  throttle: number;       // Min ms between renders (default: 16ms / 60fps)
}
```

**Rendering strategy**:
- Buffer N rows before first render (faster initial paint)
- Batch subsequent updates to avoid thrashing
- Use requestAnimationFrame for smooth updates
- Respect virtual scrolling boundaries

### 4. Memory Management

Keep memory usage low:

- ✅ Parse line-by-line (no full buffering)
- ✅ Release parsed chunks immediately
- ✅ Use streaming reader API (no intermediate strings)
- ✅ Monitor memory usage during parsing

## Implementation Plan

### Step 1: Create TSV Streaming Parser

**File**: `src/lib/parsers/tsvStreamParser.ts`

```typescript
/**
 * Streaming TSV parser for SPARQL results
 * Handles line-by-line parsing with proper RDF type extraction
 * @see https://www.w3.org/TR/sparql12-results-csv-tsv/
 */

import type { ParsedRow, ParsedCell } from '$lib/utils/resultsParser';

export interface TSVParseOptions {
  onRow?: (row: ParsedRow, rowIndex: number) => void;
  onHeaders?: (headers: string[]) => void;
  onError?: (error: ParsingError) => void;
}

export interface ParsingError {
  line: number;
  message: string;
  raw: string;
}

export class TSVStreamParser {
  private buffer = '';
  private headers: string[] = [];
  private rowIndex = 0;
  private errors: ParsingError[] = [];
  private options: TSVParseOptions;

  constructor(options: TSVParseOptions = {}) {
    this.options = options;
  }

  /**
   * Feed a chunk of data to the parser
   * @returns Parsed rows from this chunk
   */
  feed(chunk: string): ParsedRow[] {
    this.buffer += chunk;
    return this.parseBuffer();
  }

  /**
   * Signal end of stream, parse remaining buffer
   */
  end(): ParsedRow[] {
    // Parse any remaining data
    const rows = this.parseBuffer(true);

    // Handle incomplete last line
    if (this.buffer.length > 0) {
      this.errors.push({
        line: this.rowIndex,
        message: 'Incomplete line at end of stream',
        raw: this.buffer,
      });
      this.options.onError?.({
        line: this.rowIndex,
        message: 'Incomplete line at end of stream',
        raw: this.buffer,
      });
    }

    return rows;
  }

  /**
   * Get accumulated parsing errors
   */
  getErrors(): ParsingError[] {
    return [...this.errors];
  }

  /**
   * Get column headers
   */
  getHeaders(): string[] {
    return [...this.headers];
  }

  /**
   * Parse buffer into rows
   */
  private parseBuffer(final = false): ParsedRow[] {
    const rows: ParsedRow[] = [];
    let lineStart = 0;

    while (true) {
      // Find next newline
      const lineEnd = this.buffer.indexOf('\n', lineStart);

      // No complete line found
      if (lineEnd === -1) {
        // Keep unparsed data in buffer
        this.buffer = this.buffer.substring(lineStart);
        break;
      }

      // Extract line (handle \r\n and \n)
      let line = this.buffer.substring(lineStart, lineEnd);
      if (line.endsWith('\r')) {
        line = line.substring(0, line.length - 1);
      }

      // Parse line
      if (this.headers.length === 0) {
        // First line is headers
        this.parseHeaders(line);
      } else {
        // Data row
        const row = this.parseLine(line);
        if (row) {
          rows.push(row);
          this.options.onRow?.(row, this.rowIndex);
        }
      }

      this.rowIndex++;
      lineStart = lineEnd + 1;
    }

    return rows;
  }

  /**
   * Parse header line
   */
  private parseHeaders(line: string): void {
    // TSV headers are just variable names, tab-separated
    this.headers = line.split('\t').map((h) => h.trim());
    this.options.onHeaders?.(this.headers);
  }

  /**
   * Parse data line into row object
   * TSV format encodes RDF terms using SPARQL/Turtle syntax:
   * - URIs: <http://example.org/resource>
   * - Literals: "value" or "value"@lang or "value"^^<datatype>
   * - Blank nodes: _:identifier
   * @see https://www.w3.org/TR/sparql12-results-csv-tsv/#tsv
   */
  private parseLine(line: string): ParsedRow | null {
    const values = line.split('\t');

    if (values.length !== this.headers.length) {
      this.errors.push({
        line: this.rowIndex,
        message: `Column count mismatch: expected ${this.headers.length}, got ${values.length}`,
        raw: line,
      });
      this.options.onError?.({
        line: this.rowIndex,
        message: `Column count mismatch: expected ${this.headers.length}, got ${values.length}`,
        raw: line,
      });
      return null;
    }

    const row: ParsedRow = {};

    for (let i = 0; i < this.headers.length; i++) {
      const varName = this.headers[i];
      const value = values[i].trim();

      row[varName] = this.parseValue(value);
    }

    return row;
  }

  /**
   * Parse TSV value into typed cell
   * Handles SPARQL/Turtle syntax for RDF terms
   */
  private parseValue(value: string): ParsedCell {
    // Empty value = unbound
    if (value === '') {
      return { value: '', type: 'unbound' };
    }

    // URI: <http://example.org/resource>
    if (value.startsWith('<') && value.endsWith('>')) {
      const uri = value.substring(1, value.length - 1);
      return {
        value: uri,
        type: 'uri',
        rawValue: uri,
      };
    }

    // Blank node: _:identifier
    if (value.startsWith('_:')) {
      return {
        value: value,
        type: 'bnode',
        rawValue: value,
      };
    }

    // Literal with language tag: "value"@lang
    const langMatch = value.match(/^"(.*)"@(\w+)$/);
    if (langMatch) {
      return {
        value: langMatch[1],
        type: 'literal',
        lang: langMatch[2],
      };
    }

    // Literal with datatype: "value"^^<datatype>
    const datatypeMatch = value.match(/^"(.*?)"\^\^<(.+)>$/);
    if (datatypeMatch) {
      return {
        value: datatypeMatch[1],
        type: 'literal',
        datatype: datatypeMatch[2],
      };
    }

    // Plain literal: "value"
    if (value.startsWith('"') && value.endsWith('"')) {
      return {
        value: value.substring(1, value.length - 1),
        type: 'literal',
      };
    }

    // Fallback: treat as plain literal
    return {
      value: value,
      type: 'literal',
    };
  }
}
```

### Step 2: Create CSV Streaming Parser

**File**: `src/lib/parsers/csvStreamParser.ts`

Similar to TSV but:
- Handle comma separators
- Handle quoted fields with embedded commas
- Handle escape sequences
- Lossy mode (no RDF type info)

```typescript
/**
 * Streaming CSV parser for SPARQL results
 * Note: CSV format is lossy - no RDF type information preserved
 * @see https://www.w3.org/TR/sparql12-results-csv-tsv/
 */
export class CSVStreamParser {
  // Similar structure to TSVStreamParser
  // but with CSV-specific parsing logic
}
```

### Step 3: Update SparqlService for Streaming

**File**: `src/lib/services/sparqlService.ts`

Add streaming execution mode:

```typescript
interface StreamingQueryOptions extends ExtendedQueryOptions {
  streaming?: boolean;
  onRow?: (row: ParsedRow, index: number) => void;
  onHeaders?: (headers: string[]) => void;
}

async executeQueryStreaming(options: StreamingQueryOptions): Promise<StreamingQueryResult> {
  // Force CSV or TSV format
  const format = options.format === 'csv' ? 'csv' : 'tsv';

  const response = await this.executePost(/* ... */);

  // Get readable stream
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming not supported by browser');
  }

  // Create parser
  const parser = format === 'tsv'
    ? new TSVStreamParser({
        onRow: options.onRow,
        onHeaders: options.onHeaders,
      })
    : new CSVStreamParser({
        onRow: options.onRow,
        onHeaders: options.onHeaders,
      });

  // Read and parse stream
  const decoder = new TextDecoder();
  let rowCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      parser.feed(chunk);
      rowCount++;
    }

    // Parse remaining buffer
    parser.end();

  } finally {
    reader.releaseLock();
  }

  return {
    headers: parser.getHeaders(),
    rowCount,
    errors: parser.getErrors(),
  };
}
```

### Step 4: Update Results Store for Progressive Updates

**File**: `src/lib/stores/resultsStore.ts`

Support incremental row addition:

```typescript
class ResultsStore {
  // ... existing methods ...

  /**
   * Initialize streaming mode
   */
  startStreaming(headers: string[]): void {
    this.state.loading = true;
    this.state.data = {
      columns: headers,
      rows: [],
      rowCount: 0,
      vars: headers,
    };
  }

  /**
   * Add rows incrementally
   */
  addRows(rows: ParsedRow[]): void {
    if (!this.state.data || this.state.data.type === 'boolean') {
      throw new Error('Cannot add rows to non-table result');
    }

    const data = this.state.data as ParsedTableData;
    data.rows.push(...rows);
    data.rowCount = data.rows.length;

    this.notifySubscribers();
  }

  /**
   * Complete streaming
   */
  completeStreaming(): void {
    this.state.loading = false;
    this.notifySubscribers();
  }
}
```

### Step 5: Create Streaming UI Component

**File**: `src/lib/components/results/StreamingResults.svelte`

Show progressive results:

```svelte
<script lang="ts">
  import { DataTable } from '$lib/components/results/DataTable.svelte';
  import { InlineLoading } from 'carbon-components-svelte';

  interface Props {
    data: ParsedTableData;
    loading: boolean;
    rowsPerSecond?: number;
  }

  let { data, loading, rowsPerSecond }: Props = $props();
</script>

<div class="streaming-container">
  {#if loading}
    <div class="streaming-status">
      <InlineLoading description="Streaming results..." />
      <span class="row-count">
        {data.rowCount.toLocaleString()} rows received
      </span>
      {#if rowsPerSecond}
        <span class="rate">
          ({rowsPerSecond.toFixed(0)} rows/s)
        </span>
      {/if}
    </div>
  {/if}

  <DataTable data={data} />
</div>

<style>
  .streaming-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .streaming-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: var(--cds-layer-01);
    border-bottom: 1px solid var(--cds-border-subtle);
  }

  .row-count {
    font-weight: 600;
  }

  .rate {
    color: var(--cds-text-secondary);
    font-size: 0.875rem;
  }
</style>
```

## Testing Requirements

### Unit Tests

**File**: `tests/unit/parsers/tsvStreamParser.test.ts`
- Test header parsing
- Test row parsing with various RDF term types
- Test chunk boundary handling (split mid-line)
- Test error recovery
- Test type preservation (URI, literal, datatype, lang)

**File**: `tests/unit/parsers/csvStreamParser.test.ts`
- Similar tests for CSV format
- Test quoted fields with commas
- Test escape sequences

### Integration Tests

**File**: `tests/integration/streaming-results.test.ts`
- Test streaming with mock endpoint
- Test progressive rendering
- Test cancellation mid-stream
- Compare memory usage: streaming vs non-streaming

### Performance Tests

**File**: `tests/performance/streaming-performance.test.ts`
- Measure memory usage for 100k rows (streaming vs non-streaming)
- Measure time to first row
- Measure total parse time
- Verify streaming is actually more efficient

### Manual Testing
1. Execute query that returns TSV with 10k rows - verify progressive rendering
2. Execute query that returns CSV - verify works correctly
3. Cancel query mid-stream - verify cleanup
4. Compare memory usage in Chrome DevTools (streaming vs JSON)
5. Test with slow endpoint (throttled network) - verify perceived speed improvement

## Acceptance Criteria

✅ TSV streaming parser implemented with RDF type preservation
✅ CSV streaming parser implemented
✅ SparqlService supports streaming mode
✅ Results store supports progressive updates
✅ Streaming UI component shows progress
✅ Memory usage significantly lower than JSON for large results
✅ Time to first row < 100ms for streaming
✅ All tests passing
✅ Documentation updated

## Format Selection Strategy

**Automatic selection** (user can override):

```typescript
function selectFormat(analysis: QueryAnalysis, userPreference?: ResultFormat): ResultFormat {
  // User override takes precedence
  if (userPreference) {
    return userPreference;
  }

  // Small results: prefer JSON (rich metadata)
  if (analysis.limitValue && analysis.limitValue < 1000) {
    return 'json';
  }

  // Large results: prefer TSV (streaming, type-safe)
  if (analysis.limitValue && analysis.limitValue > 10000) {
    return 'tsv';
  }

  // No limit: definitely use TSV
  if (!analysis.hasLimit) {
    return 'tsv';
  }

  // Default: JSON
  return 'json';
}
```

## Documentation

Update user guide:
- Explain CSV/TSV streaming
- Document format selection logic
- Performance characteristics of each format
- When to use streaming vs standard mode

## Limitations

Known limitations of CSV/TSV formats:

**CSV**:
- ❌ No RDF type information (lossy)
- ❌ No metadata (just data)
- ✅ Universally supported
- ✅ Easy to import into other tools

**TSV**:
- ✅ Preserves RDF types
- ✅ Simpler parsing than CSV
- ⚠️ Not all endpoints support TSV (but most do)

**Both**:
- ❌ No query metadata (execution time, warnings, etc.)
- ❌ No boolean results (ASK queries return JSON)

## Future Enhancements

- 📊 Streaming for other formats (if endpoints support)
- 🎯 Adaptive batch size based on performance
- 💾 Stream directly to IndexedDB for huge results
- 🔍 Client-side filtering during streaming
- 📈 Streaming statistics and visualization
- ⚡ Web Worker for parsing (offload from main thread)

## Related Tasks

- STREAMING-01: Performance Profiling (validate streaming benefit)
- STREAMING-02: Progressive UI Feedback (show streaming progress)
- STREAMING-03: Memory Management (use streaming for large queries)
- STREAMING-05: Non-blocking Parsing (complementary for JSON)
