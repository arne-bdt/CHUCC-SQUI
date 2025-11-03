# Task: Non-Blocking JSON Parsing

**Status**: Not Started
**Priority**: Medium (improves responsiveness)
**Estimated Effort**: 4-6 hours
**Dependencies**: STREAMING-01 (Performance Profiling) - recommended

## Objective

Move JSON parsing to a Web Worker to prevent blocking the main thread during parsing of large result sets. This keeps the UI responsive even when parsing 10k+ row results.

## Why This Matters

**Current problem**:
- JSON.parse() is synchronous and blocking
- Large result sets (10k+ rows) can block main thread for 100ms-1s
- UI freezes during parse (no scrolling, clicking, typing)
- Browser shows "Page Unresponsive" warning for very large results

**Solution**:
- Parse JSON in Web Worker (background thread)
- Main thread remains responsive
- Show progress during parsing
- Can cancel parsing mid-way

**Trade-offs**:
- ✅ Main thread stays responsive
- ✅ Can show progress bar during parse
- ✅ Can cancel long-running parses
- ❌ Overhead of serialization (send data to/from worker)
- ❌ Slightly longer total parse time (~10-20% overhead)
- ⚠️ Only worthwhile for large results (> 5k rows)

## When to Use Web Worker Parsing

**Use worker parsing when**:
- Result set > 5000 rows
- Response size > 1 MB
- User has enabled "prefer performance" mode

**Use main thread parsing when**:
- Result set < 5000 rows (overhead not worth it)
- Response size < 1 MB
- Browser doesn't support Workers (rare, but possible)

## Requirements

### 1. Web Worker for JSON Parsing

**Features**:
- ✅ Parse SPARQL JSON in background thread
- ✅ Report progress during parsing
- ✅ Cancellable mid-parse
- ✅ Error handling and reporting
- ✅ Fallback to main thread if Worker fails

### 2. Progress Reporting

Report parsing progress:

```typescript
interface ParseProgress {
  phase: 'parsing';
  rowsParsed: number;
  totalRows: number;
  percentComplete: number;
  timeElapsed: number;
}
```

### 3. Adaptive Strategy

Choose parsing strategy based on result size:

```typescript
type ParsingStrategy = 'main-thread' | 'worker' | 'chunked-worker';

function selectParsingStrategy(responseSize: number, rowCount?: number): ParsingStrategy {
  // Small results: main thread (fastest)
  if (responseSize < 1_000_000 || (rowCount && rowCount < 5000)) {
    return 'main-thread';
  }

  // Large results: worker (non-blocking)
  if (responseSize > 10_000_000 || (rowCount && rowCount > 50000)) {
    return 'chunked-worker';
  }

  // Medium results: worker
  return 'worker';
}
```

### 4. Chunked Parsing

For very large results, parse in chunks:

**Benefits**:
- Progressive rendering (show partial results)
- Memory-efficient (can release chunks after processing)
- Better progress feedback

**Strategy**:
```typescript
// Parse bindings array in chunks
const CHUNK_SIZE = 1000; // Parse 1000 rows at a time

for (let i = 0; i < bindings.length; i += CHUNK_SIZE) {
  const chunk = bindings.slice(i, i + CHUNK_SIZE);
  const parsedRows = parseChunk(chunk);
  postProgress(parsedRows, i, bindings.length);
  await yieldToMainThread(); // Let main thread breathe
}
```

## Implementation Plan

### Step 1: Create Parsing Web Worker

**File**: `src/lib/workers/resultsParser.worker.ts`

```typescript
/**
 * Web Worker for non-blocking SPARQL results parsing
 */

import { parseTableResults } from '$lib/utils/resultsParser';
import type { SparqlJsonResults, ParsedTableData } from '$lib/types';

export interface ParseRequest {
  id: string;
  results: SparqlJsonResults;
  maxRows?: number;
  chunkSize?: number;
}

export interface ParseResponse {
  id: string;
  type: 'progress' | 'complete' | 'error';
  data?: ParsedTableData;
  progress?: ParseProgress;
  error?: string;
}

export interface ParseProgress {
  rowsParsed: number;
  totalRows: number;
  percentComplete: number;
  timeElapsed: number;
}

// Handle messages from main thread
self.addEventListener('message', async (event: MessageEvent<ParseRequest>) => {
  const { id, results, maxRows, chunkSize = 1000 } = event.data;

  try {
    const startTime = Date.now();

    // Check if chunked parsing needed
    const bindings = results.results?.bindings || [];
    const totalRows = bindings.length;

    if (totalRows > chunkSize) {
      // Chunked parsing for large results
      await parseChunked(id, results, maxRows, chunkSize, startTime);
    } else {
      // Standard parsing for small/medium results
      const parsed = parseTableResults(results, maxRows);
      postMessage({
        id,
        type: 'complete',
        data: parsed,
      } satisfies ParseResponse);
    }
  } catch (error) {
    postMessage({
      id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    } satisfies ParseResponse);
  }
});

/**
 * Parse results in chunks, reporting progress
 */
async function parseChunked(
  id: string,
  results: SparqlJsonResults,
  maxRows: number | undefined,
  chunkSize: number,
  startTime: number
): Promise<void> {
  const bindings = results.results?.bindings || [];
  const vars = results.head.vars || [];
  const totalRows = bindings.length;
  const maxToProcess = maxRows !== undefined ? Math.min(totalRows, maxRows) : totalRows;

  const allRows: ParsedRow[] = [];

  for (let i = 0; i < maxToProcess; i += chunkSize) {
    const end = Math.min(i + chunkSize, maxToProcess);
    const chunk = bindings.slice(i, end);

    // Parse chunk
    const chunkResults = {
      head: results.head,
      results: { bindings: chunk },
    };
    const parsed = parseTableResults(chunkResults);
    allRows.push(...parsed.rows);

    // Report progress
    const percentComplete = (end / maxToProcess) * 100;
    postMessage({
      id,
      type: 'progress',
      progress: {
        rowsParsed: end,
        totalRows: maxToProcess,
        percentComplete,
        timeElapsed: Date.now() - startTime,
      },
    } satisfies ParseResponse);

    // Yield to prevent blocking worker thread
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // Send complete result
  const isTruncated = maxRows !== undefined && totalRows > maxRows;
  const finalData: ParsedTableData = {
    columns: vars,
    rows: allRows,
    rowCount: allRows.length,
    vars,
  };

  if (isTruncated) {
    finalData.isTruncated = true;
    finalData.totalRows = totalRows;
  }

  postMessage({
    id,
    type: 'complete',
    data: finalData,
  } satisfies ParseResponse);
}
```

### Step 2: Create Worker Manager Service

**File**: `src/lib/services/workerParserService.ts`

```typescript
/**
 * Service to manage Web Worker for parsing
 */

import ParserWorker from '$lib/workers/resultsParser.worker?worker';
import type { SparqlJsonResults, ParsedTableData } from '$lib/types';
import type { ParseRequest, ParseResponse, ParseProgress } from '$lib/workers/resultsParser.worker';

export interface WorkerParseOptions {
  results: SparqlJsonResults;
  maxRows?: number;
  chunkSize?: number;
  onProgress?: (progress: ParseProgress) => void;
  signal?: AbortSignal;
}

class WorkerParserService {
  private worker: Worker | null = null;
  private requestId = 0;
  private activeRequests = new Map<string, {
    resolve: (data: ParsedTableData) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: ParseProgress) => void;
  }>();

  /**
   * Parse SPARQL JSON results in Web Worker
   */
  async parse(options: WorkerParseOptions): Promise<ParsedTableData> {
    const { results, maxRows, chunkSize, onProgress, signal } = options;

    // Initialize worker if needed
    if (!this.worker) {
      this.worker = new ParserWorker();
      this.worker.addEventListener('message', this.handleMessage.bind(this));
      this.worker.addEventListener('error', this.handleError.bind(this));
    }

    // Generate request ID
    const id = `parse-${++this.requestId}`;

    // Create promise for result
    return new Promise<ParsedTableData>((resolve, reject) => {
      // Store request
      this.activeRequests.set(id, { resolve, reject, onProgress });

      // Handle cancellation
      if (signal) {
        signal.addEventListener('abort', () => {
          this.activeRequests.delete(id);
          reject(new Error('Parse cancelled'));
        });
      }

      // Send request to worker
      this.worker!.postMessage({
        id,
        results,
        maxRows,
        chunkSize,
      } satisfies ParseRequest);
    });
  }

  /**
   * Handle message from worker
   */
  private handleMessage(event: MessageEvent<ParseResponse>): void {
    const { id, type, data, progress, error } = event.data;

    const request = this.activeRequests.get(id);
    if (!request) return;

    if (type === 'progress' && progress) {
      request.onProgress?.(progress);
    } else if (type === 'complete' && data) {
      this.activeRequests.delete(id);
      request.resolve(data);
    } else if (type === 'error' && error) {
      this.activeRequests.delete(id);
      request.reject(new Error(error));
    }
  }

  /**
   * Handle worker error
   */
  private handleError(event: ErrorEvent): void {
    console.error('Worker error:', event);
    // Reject all active requests
    for (const [id, request] of this.activeRequests) {
      request.reject(new Error('Worker error: ' + event.message));
      this.activeRequests.delete(id);
    }
  }

  /**
   * Terminate worker (cleanup)
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.activeRequests.clear();
  }
}

export const workerParserService = new WorkerParserService();
```

### Step 3: Add Adaptive Parsing Strategy

**File**: `src/lib/services/queryExecutionService.ts`

```typescript
import { workerParserService } from './workerParserService';

async executeQuery(options: QueryOptions): Promise<void> {
  // ... fetch results ...

  const response = await sparqlService.executeQuery(options);
  const { raw, data, contentType } = response;

  // Determine parsing strategy
  const responseSize = raw.length;
  const estimatedRows = typeof data === 'object' && 'results' in data
    ? data.results?.bindings?.length
    : 0;

  const strategy = selectParsingStrategy(responseSize, estimatedRows);

  let parsed: ParsedTableData;

  if (strategy === 'main-thread') {
    // Fast path: parse on main thread
    resultsStore.setProgress({ phase: 'parsing', startTime: Date.now() });
    parsed = parseResults(data as SparqlJsonResults);
  } else {
    // Worker path: non-blocking parse
    resultsStore.setProgress({
      phase: 'parsing',
      startTime: Date.now(),
      totalRows: estimatedRows,
    });

    parsed = await workerParserService.parse({
      results: data as SparqlJsonResults,
      maxRows: settings.maxRows,
      chunkSize: strategy === 'chunked-worker' ? 1000 : undefined,
      onProgress: (progress) => {
        resultsStore.setProgress({
          phase: 'parsing',
          startTime: Date.now(),
          rowsParsed: progress.rowsParsed,
          totalRows: progress.totalRows,
        });
      },
      signal: options.signal,
    });
  }

  resultsStore.setData(parsed);
}

function selectParsingStrategy(
  responseSize: number,
  rowCount?: number
): 'main-thread' | 'worker' | 'chunked-worker' {
  // Small: main thread (fastest, least overhead)
  if (responseSize < 1_000_000 || (rowCount && rowCount < 5000)) {
    return 'main-thread';
  }

  // Very large: chunked worker (progressive)
  if (responseSize > 10_000_000 || (rowCount && rowCount > 50000)) {
    return 'chunked-worker';
  }

  // Large: worker (non-blocking)
  return 'worker';
}
```

### Step 4: Add Parsing Progress UI

Already covered by STREAMING-02 (Progressive UI Feedback), but enhance for chunked parsing:

```svelte
{#if progress.phase === 'parsing' && progress.totalRows}
  <div class="parsing-progress">
    <InlineLoading description="Parsing results..." />
    <progress
      value={progress.rowsParsed || 0}
      max={progress.totalRows}
    />
    <span>
      {(progress.rowsParsed || 0).toLocaleString()} / {progress.totalRows.toLocaleString()}
      ({((progress.rowsParsed || 0) / progress.totalRows * 100).toFixed(0)}%)
    </span>
  </div>
{/if}
```

### Step 5: Add Settings for Parsing Strategy

**File**: `src/lib/stores/settingsStore.ts`

```typescript
interface Settings {
  // ... existing settings ...

  parsing: {
    strategy: 'auto' | 'main-thread' | 'worker';
    workerThreshold: number;  // Rows to trigger worker (default: 5000)
    chunkSize: number;        // Rows per chunk (default: 1000)
  };
}
```

## Testing Requirements

### Unit Tests

**File**: `tests/unit/workers/resultsParser.worker.test.ts`
- Test worker parsing (mock worker environment)
- Test chunked parsing
- Test progress reporting
- Test error handling

**File**: `tests/unit/services/workerParserService.test.ts`
- Test request/response handling
- Test progress callbacks
- Test cancellation
- Test fallback to main thread

### Integration Tests

**File**: `tests/integration/worker-parsing.test.ts`
- Test end-to-end worker parsing
- Test with various dataset sizes
- Test cancellation during parse
- Compare main thread vs worker results (should be identical)

### Performance Tests

**File**: `tests/performance/parsing-strategies.test.ts`
- Measure main thread block time (should be ~0ms with worker)
- Compare total parse time (main thread vs worker)
- Measure overhead of worker (serialization, etc.)
- Test UI responsiveness during parse

**Acceptance threshold**:
- Worker parsing should add < 20% overhead
- Main thread should remain responsive (< 16ms tasks)
- Chunked parsing should show progress updates every 100ms

### Manual Testing
1. Parse 10k row result in main thread - observe UI freeze
2. Parse 10k row result in worker - verify UI stays responsive
3. Parse 50k row result with chunked worker - verify progress updates
4. Cancel parse mid-way - verify cleanup
5. Test fallback when worker unavailable

## Acceptance Criteria

✅ Web Worker for parsing implemented
✅ Worker manager service handles requests/responses
✅ Adaptive strategy selects main thread vs worker
✅ Chunked parsing for very large results
✅ Progress reporting during chunked parse
✅ Main thread remains responsive during worker parse
✅ Cancellation works correctly
✅ All tests passing
✅ Documentation updated

## Browser Compatibility

**Web Workers** are widely supported:
- ✅ Chrome/Edge: Yes
- ✅ Firefox: Yes
- ✅ Safari: Yes
- ✅ Mobile browsers: Yes

**Fallback** if Workers unavailable:
- Detect: `typeof Worker === 'undefined'`
- Use main thread parsing
- Show warning: "Parsing large results may affect responsiveness"

## Performance Characteristics

**Expected metrics** (based on research and testing):

| Strategy | Result Size | Parse Time | Main Thread Block | Memory |
|----------|-------------|------------|-------------------|--------|
| Main thread | 1k rows | ~10ms | 10ms | Low |
| Main thread | 10k rows | ~100ms | 100ms | Medium |
| Worker | 10k rows | ~120ms | ~0ms | Medium |
| Chunked worker | 50k rows | ~600ms | ~0ms | High |

**Key insight**: Worker adds ~20% overhead but keeps UI responsive.

## Documentation

Update user guide:
- Explain parsing strategies
- Document settings for customization
- Performance characteristics
- When worker parsing is used

## Future Enhancements

- 🔄 Worker pool for parallel parsing (multiple queries)
- 📊 Parse in background while user types next query
- 💾 Cache parsed results in IndexedDB
- 🎯 Smart chunking based on row complexity
- ⚡ WASM parser for even faster parsing
- 🔍 Client-side filtering during parse (skip non-matching rows)

## Related Tasks

- STREAMING-01: Performance Profiling (measure worker overhead)
- STREAMING-02: Progressive UI Feedback (show parse progress)
- STREAMING-04: CSV/TSV Streaming (alternative for large results)
