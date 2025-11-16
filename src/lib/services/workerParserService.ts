/**
 * Service to manage Web Worker for parsing
 * Handles request/response communication and lifecycle
 */

import type { SparqlJsonResults } from '../types';
import type { ParsedTableData } from '../utils/resultsParser';
import type { ParseRequest, ParseResponse, ParseProgress } from '../workers/resultsParser.worker';
import { logger } from '../utils/logger';

/**
 * Options for parsing in worker
 */
export interface WorkerParseOptions {
  /** SPARQL JSON results to parse */
  results: SparqlJsonResults;
  /** Optional maximum rows to parse */
  maxRows?: number;
  /** Chunk size for large results (default: 1000) */
  chunkSize?: number;
  /** Progress callback */
  onProgress?: (progress: ParseProgress) => void;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Active request tracking
 */
interface ActiveRequest {
  resolve: (data: ParsedTableData) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: ParseProgress) => void;
}

/**
 * Worker Parser Service
 * Manages Web Worker for non-blocking SPARQL results parsing
 */
class WorkerParserService {
  private worker: Worker | null = null;
  private requestId = 0;
  private activeRequests = new Map<string, ActiveRequest>();

  /**
   * Parse SPARQL JSON results in Web Worker
   * @param options - Parsing options
   * @returns Parsed table data
   */
  async parse(options: WorkerParseOptions): Promise<ParsedTableData> {
    const { results, maxRows, chunkSize, onProgress, signal } = options;

    // Initialize worker if needed
    if (!this.worker) {
      try {
        // Import worker using Vite's ?worker syntax
        const ParserWorker = await import('../workers/resultsParser.worker?worker');
        this.worker = new ParserWorker.default();
        this.worker.addEventListener('message', this.handleMessage.bind(this));
        this.worker.addEventListener('error', this.handleError.bind(this));
      } catch (error) {
        throw new Error('Failed to initialize Web Worker: ' + (error instanceof Error ? error.message : String(error)));
      }
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
    logger.error('Worker error:', event);
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

  /**
   * Check if workers are supported
   */
  isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }
}

/**
 * Singleton instance
 */
export const workerParserService = new WorkerParserService();

/**
 * Check if Web Workers are supported
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}
