/**
 * Web Worker for non-blocking SPARQL results parsing
 * Parses SPARQL JSON in background thread to prevent UI blocking
 */

import { parseTableResults } from '../utils/resultsParser';
import type { SparqlJsonResults } from '../types';
import type { ParsedTableData } from '../utils/resultsParser';

/**
 * Request message to parse SPARQL results
 */
export interface ParseRequest {
  /** Unique request ID */
  id: string;
  /** SPARQL JSON results to parse */
  results: SparqlJsonResults;
  /** Optional maximum rows to parse (for memory safety) */
  maxRows?: number;
  /** Chunk size for large results (rows per chunk) */
  chunkSize?: number;
}

/**
 * Response message from worker
 */
export interface ParseResponse {
  /** Request ID */
  id: string;
  /** Response type */
  type: 'progress' | 'complete' | 'error';
  /** Parsed data (for 'complete' type) */
  data?: ParsedTableData;
  /** Progress info (for 'progress' type) */
  progress?: ParseProgress;
  /** Error message (for 'error' type) */
  error?: string;
}

/**
 * Progress information during parsing
 */
export interface ParseProgress {
  /** Number of rows parsed so far */
  rowsParsed: number;
  /** Total rows to parse */
  totalRows: number;
  /** Percent complete (0-100) */
  percentComplete: number;
  /** Time elapsed in milliseconds */
  timeElapsed: number;
}

/**
 * Handle messages from main thread
 */
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

  const allRows: ParsedTableData['rows'] = [];

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
