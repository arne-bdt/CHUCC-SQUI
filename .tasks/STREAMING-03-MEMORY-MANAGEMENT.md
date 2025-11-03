# Task: Memory Management & Large Result Warnings

**Status**: Not Started
**Priority**: High (safety/stability)
**Estimated Effort**: 3-4 hours
**Dependencies**: STREAMING-01 (Performance Profiling) - recommended

## Objective

Prevent browser crashes and poor user experience by proactively warning users about queries that may return large result sets, and providing safer alternatives (download instead of view).

## Why This Matters

**Current problem**:
- ✅ maxRows limit exists (prevents parsing huge datasets)
- ❌ No warning before executing large queries
- ❌ Generic error when maxRows exceeded
- ❌ No guidance on what to do instead
- ❌ Browser can still freeze/crash during parsing

**Solution**:
- ⚠️ Warn before executing queries with LIMIT > maxRows
- ⚠️ Warn before executing queries without LIMIT
- ✅ Suggest "Download CSV" instead of "View in browser"
- ✅ Better error messages when truncated
- ✅ Memory usage monitoring and warnings

## Requirements

### 1. Pre-Query Warnings

Analyze query before execution:

```typescript
interface QueryAnalysis {
  hasLimit: boolean;
  limitValue?: number;
  estimatedRowCount: 'small' | 'medium' | 'large' | 'unbounded';
  recommendation: 'safe' | 'warn' | 'download-instead';
  warning?: string;
}
```

**Warning levels**:
- ✅ **Safe** (< 10k rows): Execute normally
- ⚠️ **Warn** (10k-50k rows): Show warning, allow execution
- 🚫 **Download** (> 50k or no LIMIT): Recommend CSV download instead

### 2. Query Warning Dialog

Show modal before executing large queries:

```
⚠️ Large Result Set Expected

This query may return more than 50,000 results, which can cause your browser to freeze or crash.

Recommendations:
• Add LIMIT clause to restrict results (e.g., LIMIT 1000)
• Download results as CSV file instead of viewing in browser
• Use more specific WHERE conditions to reduce result size

Estimated results: > 50,000 rows
Memory usage: ~150 MB
Risk: High

[Cancel] [Download CSV] [Execute Anyway]
```

### 3. Post-Query Truncation Warnings

When results are truncated by maxRows:

```
ℹ️ Results Truncated

Showing 10,000 of 47,532 results (37,532 rows not displayed)

The full result set was too large to display safely in your browser.

Options:
• [Download Full Results as CSV] - Get all 47,532 rows
• [Refine Query] - Add LIMIT or WHERE clause
• [Adjust Settings] - Increase maxRows limit (may affect performance)
```

### 4. Memory Usage Monitoring

Track and warn about memory usage:

```typescript
interface MemoryStatus {
  usedMB: number;
  limitMB: number;
  percentUsed: number;
  warning: boolean; // true if > 80%
  critical: boolean; // true if > 95%
}
```

Show warnings:
- ⚠️ **80% memory**: "High memory usage. Consider closing other tabs."
- 🚫 **95% memory**: "Critical memory usage. Browser may become unresponsive."

### 5. Smart Download Suggestions

Offer CSV download based on context:

**Trigger download suggestion when**:
- Query has no LIMIT clause
- Query LIMIT > 50,000
- Query execution time > 30s
- Memory usage > 80%
- Previous similar query crashed

**CSV Download features**:
- ✅ Stream directly to file (no memory overhead)
- ✅ Progress indicator during download
- ✅ Automatic filename from query
- ✅ Optional compression (gzip)

## Implementation Plan

### Step 1: Create Query Analyzer

**File**: `src/lib/utils/queryAnalyzer.ts`

```typescript
/**
 * Analyze SPARQL query for potential performance/memory issues
 */
export interface QueryAnalysis {
  hasLimit: boolean;
  limitValue?: number;
  hasOffset: boolean;
  offsetValue?: number;
  estimatedRowCount: 'small' | 'medium' | 'large' | 'unbounded';
  estimatedMemoryMB?: number;
  recommendation: 'safe' | 'warn' | 'download-instead';
  warnings: string[];
}

export function analyzeQuery(query: string): QueryAnalysis {
  const normalized = query.toUpperCase();

  // Check for LIMIT clause
  const limitMatch = normalized.match(/LIMIT\s+(\d+)/);
  const hasLimit = !!limitMatch;
  const limitValue = limitMatch ? parseInt(limitMatch[1], 10) : undefined;

  // Check for OFFSET clause
  const offsetMatch = normalized.match(/OFFSET\s+(\d+)/);
  const hasOffset = !!offsetMatch;
  const offsetValue = offsetMatch ? parseInt(offsetMatch[1], 10) : undefined;

  // Estimate result size
  let estimatedRowCount: QueryAnalysis['estimatedRowCount'];
  let estimatedMemoryMB: number | undefined;

  if (!hasLimit) {
    estimatedRowCount = 'unbounded';
  } else if (limitValue! < 1000) {
    estimatedRowCount = 'small';
    estimatedMemoryMB = limitValue! * 0.001; // ~1 KB per row
  } else if (limitValue! < 10000) {
    estimatedRowCount = 'medium';
    estimatedMemoryMB = limitValue! * 0.001;
  } else {
    estimatedRowCount = 'large';
    estimatedMemoryMB = limitValue! * 0.001;
  }

  // Determine recommendation
  let recommendation: QueryAnalysis['recommendation'];
  const warnings: string[] = [];

  if (!hasLimit) {
    recommendation = 'download-instead';
    warnings.push('Query has no LIMIT clause - may return millions of results');
  } else if (limitValue! > 50000) {
    recommendation = 'download-instead';
    warnings.push(`Large LIMIT (${limitValue!.toLocaleString()}) - may exhaust browser memory`);
  } else if (limitValue! > 10000) {
    recommendation = 'warn';
    warnings.push(`Medium LIMIT (${limitValue!.toLocaleString()}) - may be slow`);
  } else {
    recommendation = 'safe';
  }

  // Warn about OFFSET usage
  if (hasOffset && offsetValue! > 10000) {
    warnings.push(`Large OFFSET (${offsetValue!.toLocaleString()}) - query may be slow`);
  }

  return {
    hasLimit,
    limitValue,
    hasOffset,
    offsetValue,
    estimatedRowCount,
    estimatedMemoryMB,
    recommendation,
    warnings,
  };
}
```

### Step 2: Create Warning Dialog Component

**File**: `src/lib/components/query/QueryWarningDialog.svelte`

```svelte
<script lang="ts">
  import { Modal, Button } from 'carbon-components-svelte';
  import type { QueryAnalysis } from '$lib/utils/queryAnalyzer';

  interface Props {
    open: boolean;
    analysis: QueryAnalysis;
    onCancel: () => void;
    onDownloadCSV: () => void;
    onExecuteAnyway: () => void;
  }

  let { open, analysis, onCancel, onDownloadCSV, onExecuteAnyway }: Props = $props();

  const title = $derived(
    analysis.recommendation === 'download-instead'
      ? '🚫 Large Result Set - Download Recommended'
      : '⚠️ Large Result Set Warning'
  );

  const riskLevel = $derived.by(() => {
    if (analysis.estimatedRowCount === 'unbounded') return 'Critical';
    if (analysis.estimatedRowCount === 'large') return 'High';
    return 'Medium';
  });
</script>

<Modal
  bind:open
  {title}
  modalHeading={title}
  primaryButtonText="Download CSV"
  secondaryButtonText={analysis.recommendation === 'download-instead' ? 'Cancel' : 'Execute Anyway'}
  on:click:button--primary={onDownloadCSV}
  on:click:button--secondary={() => {
    if (analysis.recommendation === 'download-instead') {
      onCancel();
    } else {
      onExecuteAnyway();
    }
  }}
  on:close={onCancel}
  danger={analysis.recommendation === 'download-instead'}
>
  <div class="warning-content">
    <p>
      {#if analysis.recommendation === 'download-instead'}
        This query may return a very large result set that could freeze or crash your browser.
      {:else}
        This query may return a large result set that could slow down your browser.
      {/if}
    </p>

    <h4>Analysis:</h4>
    <ul>
      {#each analysis.warnings as warning}
        <li>{warning}</li>
      {/each}
      {#if analysis.estimatedMemoryMB}
        <li>Estimated memory: ~{analysis.estimatedMemoryMB.toFixed(0)} MB</li>
      {/if}
      <li>Risk level: <strong>{riskLevel}</strong></li>
    </ul>

    <h4>Recommendations:</h4>
    <ul>
      <li>✅ Download results as CSV file (memory-efficient)</li>
      {#if !analysis.hasLimit}
        <li>✅ Add LIMIT clause (e.g., <code>LIMIT 1000</code>)</li>
      {:else if analysis.limitValue && analysis.limitValue > 10000}
        <li>✅ Reduce LIMIT value (e.g., <code>LIMIT 1000</code>)</li>
      {/if}
      <li>✅ Use more specific WHERE conditions</li>
      <li>✅ Execute in smaller batches with OFFSET</li>
    </ul>
  </div>
</Modal>

<style>
  .warning-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h4 {
    margin-top: 1rem;
    font-weight: 600;
  }

  ul {
    margin-left: 1.5rem;
  }

  code {
    background: var(--cds-field);
    padding: 0.125rem 0.25rem;
    border-radius: 2px;
    font-family: 'IBM Plex Mono', monospace;
  }
</style>
```

### Step 3: Create Truncation Warning Component

**File**: `src/lib/components/results/TruncationWarning.svelte`

```svelte
<script lang="ts">
  import { InlineNotification, Button } from 'carbon-components-svelte';
  import { Download } from 'carbon-icons-svelte';
  import type { ParsedTableData } from '$lib/utils/resultsParser';

  interface Props {
    data: ParsedTableData;
    onDownloadFull: () => void;
    onRefineQuery: () => void;
  }

  let { data, onDownloadFull, onRefineQuery }: Props = $props();

  const hiddenRows = $derived((data.totalRows || 0) - data.rowCount);
</script>

{#if data.isTruncated}
  <InlineNotification
    kind="warning"
    title="Results Truncated"
    subtitle="Showing {data.rowCount.toLocaleString()} of {data.totalRows?.toLocaleString()} results ({hiddenRows.toLocaleString()} rows not displayed)"
    hideCloseButton
  >
    <div slot="actions" class="actions">
      <Button
        size="small"
        kind="tertiary"
        icon={Download}
        on:click={onDownloadFull}
      >
        Download Full Results
      </Button>
      <Button size="small" kind="ghost" on:click={onRefineQuery}>
        Refine Query
      </Button>
    </div>
  </InlineNotification>
{/if}

<style>
  .actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
```

### Step 4: Integrate into Query Execution Flow

**File**: `src/lib/services/queryExecutionService.ts`

```typescript
import { analyzeQuery } from '$lib/utils/queryAnalyzer';

async executeQuery(options: QueryOptions): Promise<void> {
  // Analyze query BEFORE execution
  const analysis = analyzeQuery(options.query);

  // Show warning if needed
  if (analysis.recommendation === 'warn' || analysis.recommendation === 'download-instead') {
    const proceed = await showQueryWarning(analysis);
    if (!proceed) {
      return; // User cancelled
    }
  }

  // Execute query...
  resultsStore.setLoading(true);
  // ... rest of execution ...
}
```

### Step 5: Add Memory Monitoring

**File**: `src/lib/stores/systemStore.ts` (new)

```typescript
/**
 * System resource monitoring store
 */
export interface SystemState {
  memory?: MemoryStatus;
  lastUpdated: Date;
}

export interface MemoryStatus {
  usedMB: number;
  limitMB: number;
  percentUsed: number;
  warning: boolean;
  critical: boolean;
}

class SystemStore {
  private state: SystemState = $state({
    memory: undefined,
    lastUpdated: new Date(),
  });

  constructor() {
    // Poll memory usage every 5 seconds (if available)
    if ('memory' in performance) {
      setInterval(() => this.updateMemory(), 5000);
    }
  }

  private updateMemory(): void {
    // @ts-expect-error - performance.memory is non-standard
    const memory = performance.memory as MemoryInfo;
    if (!memory) return;

    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const percentUsed = (usedMB / limitMB) * 100;

    this.state.memory = {
      usedMB,
      limitMB,
      percentUsed,
      warning: percentUsed > 80,
      critical: percentUsed > 95,
    };
    this.state.lastUpdated = new Date();
  }

  getMemoryStatus(): MemoryStatus | undefined {
    return this.state.memory;
  }
}

export const systemStore = new SystemStore();
```

## Testing Requirements

### Unit Tests

**File**: `tests/unit/utils/queryAnalyzer.test.ts`
- Test LIMIT detection and parsing
- Test OFFSET detection
- Test estimation logic
- Test recommendation levels
- Test edge cases (no LIMIT, LIMIT 0, etc.)

### Integration Tests

**File**: `tests/integration/query-warnings.test.ts`
- Test warning dialog shown for large queries
- Test CSV download triggered from warning
- Test truncation warning shown
- Mock memory API for testing

### Manual Testing
1. Execute query with no LIMIT - verify "download instead" warning
2. Execute query with LIMIT 50000 - verify warning shown
3. Execute query that triggers truncation - verify truncation warning
4. Test "Download CSV" action from warnings
5. Test memory monitoring (in Chrome with performance.memory)

## Acceptance Criteria

✅ Query analyzer detects LIMIT and OFFSET clauses
✅ Warning dialog shown for large queries
✅ Recommendation levels work correctly (safe/warn/download)
✅ CSV download offered as alternative
✅ Truncation warning shown when maxRows exceeded
✅ Memory monitoring implemented (when available)
✅ All tests passing
✅ Documentation updated

## Configuration

Add to settings store:

```typescript
interface QuerySettings {
  maxRows: number;           // Default: 10000
  warnThreshold: number;     // Show warning if LIMIT > this (default: 10000)
  downloadThreshold: number; // Recommend download if LIMIT > this (default: 50000)
  memoryWarning: number;     // Warn at % memory usage (default: 80)
}
```

## Documentation

Update user guide:
- Explain query analysis and warnings
- Document memory management
- Best practices for large result sets
- How to download CSV instead of viewing

## Future Enhancements

- 📊 Historical query size tracking
- 🎯 Smarter estimation (analyze WHERE clauses)
- 💾 Persistent "don't warn me again" preference
- 🔍 Suggest query optimizations
- 📈 Memory usage chart in debug panel
- ⚡ Automatic query optimization suggestions

## Related Tasks

- STREAMING-01: Performance Profiling (provides memory metrics)
- STREAMING-04: CSV/TSV Streaming (download alternative)
