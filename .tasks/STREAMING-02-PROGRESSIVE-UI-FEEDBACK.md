# Task: Progressive UI Feedback

**Status**: Completed
**Priority**: High (low effort, high perceived value)
**Estimated Effort**: 2-3 hours
**Dependencies**: STREAMING-01 (Performance Profiling) - optional but recommended

## Objective

Improve perceived performance by providing detailed, real-time feedback during query execution, result download, and parsing phases. Users should always know what's happening and see progress.

## Why This Matters

**Current problem**: User sees generic "Loading..." spinner with no detail about what's happening:
- Is the query still executing on the server?
- Is the response downloading?
- Is the browser parsing results?
- Is it stuck or still working?

**Solution**: Show specific progress states and metrics:
- ✅ "Executing query on endpoint..."
- ✅ "Receiving response... 1.2 MB / 3.5 MB (34%)"
- ✅ "Parsing 25,000 results..."
- ✅ "Rendering results..."

**Impact**: Users perceive better performance even when actual time is unchanged (psychological UX improvement).

## Requirements

### 1. Query Execution States

Track and display distinct states:

```typescript
type QueryExecutionState =
  | { phase: 'idle' }
  | { phase: 'executing'; startTime: number }
  | { phase: 'downloading'; bytesReceived: number; totalBytes?: number; startTime: number }
  | { phase: 'parsing'; rowCount?: number; startTime: number }
  | { phase: 'rendering'; startTime: number }
  | { phase: 'complete'; totalTime: number; rowCount: number }
  | { phase: 'error'; error: QueryError };
```

### 2. Progress Indicators

Show phase-specific UI:

**Executing Phase**:
- 🔄 Spinner + "Executing query on endpoint..."
- ⏱️ Elapsed time counter: "5s"
- ⚠️ If slow (> 10s): "Query is taking longer than usual..."
- 🚫 Cancel button (already implemented)

**Downloading Phase**:
- 🔄 Spinner + "Receiving response..."
- 📊 Bytes received: "1.2 MB received"
- 📊 If Content-Length known: Progress bar + "1.2 MB / 3.5 MB (34%)"
- ⏱️ Download speed: "250 KB/s"

**Parsing Phase**:
- 🔄 Spinner + "Parsing results..."
- 📊 If row count known: "Parsing 25,000 rows..."
- ⏱️ Elapsed time: "1.2s"
- 💾 Memory usage (if available): "Using 45 MB"

**Rendering Phase**:
- 🔄 Spinner + "Rendering results..."
- Quick phase (usually < 100ms due to virtual scrolling)

**Complete Phase**:
- ✅ Show results
- ✅ Summary: "25,000 results in 8.3s"

### 3. Cancelable at Any Phase

User can cancel during:
- ✅ Executing (abort fetch)
- ✅ Downloading (abort fetch)
- ✅ Parsing (abort parsing loop)
- ✅ Rendering (abort render)

## Implementation Plan

### Step 1: Extend Results Store with Progress States

**File**: `src/lib/stores/resultsStore.ts`

```typescript
export interface ResultsState {
  loading: boolean;
  progress?: ProgressState; // NEW
  data: ParsedResults | null;
  raw: string | null;
  error: QueryError | null;
  executionTime: number;
  queryHistory: QueryHistoryEntry[];
}

export interface ProgressState {
  phase: 'executing' | 'downloading' | 'parsing' | 'rendering';
  startTime: number;

  // Download progress
  bytesReceived?: number;
  totalBytes?: number;
  downloadSpeed?: number; // bytes per second

  // Parse progress
  rowsParsed?: number;
  totalRows?: number;

  // Memory
  memoryUsageMB?: number;
}

class ResultsStore {
  // ... existing methods ...

  setProgress(progress: ProgressState): void {
    this.state.progress = progress;
    this.notifySubscribers();
  }

  clearProgress(): void {
    this.state.progress = undefined;
    this.notifySubscribers();
  }
}
```

### Step 2: Update SparqlService to Report Progress

**File**: `src/lib/services/sparqlService.ts`

```typescript
export interface QueryProgressCallback {
  (progress: ProgressState): void;
}

export interface ExtendedQueryOptions extends QueryOptions {
  format?: ResultFormat;
  onProgress?: QueryProgressCallback; // NEW
}

async executeQuery(options: ExtendedQueryOptions): Promise<InternalQueryResult> {
  const { onProgress } = options;

  // Phase 1: Executing
  onProgress?.({
    phase: 'executing',
    startTime: Date.now(),
  });

  const response = await fetch(...);

  // Phase 2: Downloading
  const reader = response.body?.getReader();
  const contentLength = response.headers.get('Content-Length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : undefined;

  let bytesReceived = 0;
  const chunks: Uint8Array[] = [];
  const downloadStartTime = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    bytesReceived += value.length;

    const elapsed = (Date.now() - downloadStartTime) / 1000;
    const downloadSpeed = bytesReceived / elapsed;

    onProgress?.({
      phase: 'downloading',
      startTime: downloadStartTime,
      bytesReceived,
      totalBytes,
      downloadSpeed,
    });
  }

  // Reconstruct response
  const blob = new Blob(chunks);
  const text = await blob.text();

  // Phase 3: Parsing
  onProgress?.({
    phase: 'parsing',
    startTime: Date.now(),
  });

  const data = JSON.parse(text);

  // Phase 4: Complete
  onProgress?.({
    phase: 'rendering',
    startTime: Date.now(),
  });

  return { data, raw: text, ... };
}
```

### Step 3: Update QueryExecutionService

**File**: `src/lib/services/queryExecutionService.ts`

Wire progress callbacks to results store:

```typescript
async executeQuery(options: QueryOptions): Promise<void> {
  resultsStore.setLoading(true);

  try {
    const result = await sparqlService.executeQuery({
      ...options,
      onProgress: (progress) => {
        resultsStore.setProgress(progress);
      },
    });

    // ...
  } finally {
    resultsStore.clearProgress();
  }
}
```

### Step 4: Create ProgressIndicator Component

**File**: `src/lib/components/results/ProgressIndicator.svelte`

```svelte
<script lang="ts">
  import { InlineLoading } from 'carbon-components-svelte';
  import type { ProgressState } from '$lib/stores/resultsStore';

  interface Props {
    progress: ProgressState;
  }

  let { progress }: Props = $props();

  const elapsed = $derived((Date.now() - progress.startTime) / 1000);

  const message = $derived.by(() => {
    switch (progress.phase) {
      case 'executing':
        return `Executing query... ${elapsed.toFixed(1)}s`;

      case 'downloading': {
        if (progress.totalBytes) {
          const percent = ((progress.bytesReceived || 0) / progress.totalBytes * 100).toFixed(0);
          const mbReceived = ((progress.bytesReceived || 0) / 1024 / 1024).toFixed(1);
          const mbTotal = (progress.totalBytes / 1024 / 1024).toFixed(1);
          return `Receiving response... ${mbReceived} MB / ${mbTotal} MB (${percent}%)`;
        } else {
          const mbReceived = ((progress.bytesReceived || 0) / 1024 / 1024).toFixed(1);
          return `Receiving response... ${mbReceived} MB received`;
        }
      }

      case 'parsing': {
        if (progress.totalRows) {
          const percent = ((progress.rowsParsed || 0) / progress.totalRows * 100).toFixed(0);
          return `Parsing ${progress.totalRows.toLocaleString()} results... ${percent}%`;
        }
        return `Parsing results... ${elapsed.toFixed(1)}s`;
      }

      case 'rendering':
        return 'Rendering results...';
    }
  });

  const showWarning = $derived(progress.phase === 'executing' && elapsed > 10);
</script>

<div class="progress-indicator">
  <InlineLoading description={message} />

  {#if progress.phase === 'downloading' && progress.totalBytes}
    <progress
      value={progress.bytesReceived || 0}
      max={progress.totalBytes}
      class="download-progress"
    />
  {/if}

  {#if showWarning}
    <div class="warning">
      ⚠️ Query is taking longer than usual. This may indicate a complex query or slow endpoint.
    </div>
  {/if}

  {#if progress.downloadSpeed}
    <div class="stats">
      📊 {(progress.downloadSpeed / 1024).toFixed(0)} KB/s
    </div>
  {/if}
</div>

<style>
  .progress-indicator {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .download-progress {
    width: 100%;
    height: 4px;
  }

  .warning {
    color: var(--cds-text-error);
    font-size: 0.875rem;
  }

  .stats {
    color: var(--cds-text-secondary);
    font-size: 0.875rem;
  }
</style>
```

### Step 5: Integrate into Results Container

**File**: `src/lib/components/results/ResultsContainer.svelte`

Show progress indicator when loading:

```svelte
{#if $state.loading && $state.progress}
  <ProgressIndicator progress={$state.progress} />
{:else if $state.loading}
  <InlineLoading description="Loading..." />
{:else if $state.error}
  <ErrorDisplay error={$state.error} />
{:else if $state.data}
  <ResultsDisplay data={$state.data} />
{/if}
```

## Testing Requirements

### Unit Tests

**File**: `tests/unit/components/ProgressIndicator.test.ts`
- Test each progress phase renders correctly
- Test percentage calculations
- Test elapsed time display
- Test warning shown after 10s
- Test download speed calculation

### Integration Tests

**File**: `tests/integration/query-progress.test.ts`
- Test progress states update during query execution
- Test transitions between phases
- Test cancellation at each phase
- Mock slow endpoints to test UI
- Mock large responses to test download progress

### Manual Testing
1. Execute quick query (< 1s) - verify smooth transitions
2. Execute slow query (> 10s) - verify warning appears
3. Execute query with large response (> 1 MB) - verify download progress
4. Cancel during each phase - verify cancellation works
5. Test with endpoint that doesn't send Content-Length

## Accessibility

- ✅ Use semantic HTML progress element
- ✅ Provide aria-live announcements for screen readers
- ✅ Ensure focus management during phase transitions
- ✅ Support keyboard navigation (Cancel button accessible)

## Documentation

Update user guide:
- Explain what each progress phase means
- Document when warnings appear
- Explain how to cancel long-running queries

## Acceptance Criteria

✅ Progress states tracked through all query phases
✅ Phase-specific UI messages shown
✅ Download progress shown with bytes/percentage when available
✅ Warning shown for slow queries (> 10s)
✅ Download speed displayed
✅ Smooth transitions between phases
✅ Query can be canceled at any phase
✅ All tests passing
✅ Accessible to screen readers
✅ Documentation updated

## Performance Considerations

- Progress updates should not block main thread
- Limit progress callback frequency (max 10 Hz / 100ms intervals)
- Use requestAnimationFrame for smooth UI updates
- Avoid excessive DOM updates

## Future Enhancements

- 📊 Estimated time remaining (based on download speed)
- 🎯 Query complexity estimator (warn before execution)
- 📈 Historical performance comparison ("Usually takes 2-3s")
- 💾 Persistent progress for long queries (survive page refresh)
- 🔔 Browser notification when long query completes

## Related Tasks

- STREAMING-01: Performance Profiling (provides metrics)
- STREAMING-05: Non-blocking Parsing (needs progress UI)
- STREAMING-04: CSV/TSV Streaming (needs progressive rendering feedback)
