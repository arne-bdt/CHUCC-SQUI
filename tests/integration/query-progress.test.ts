/**
 * Integration tests for query progress tracking
 * STREAMING-02: Tests progress state updates during query execution
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resultsStore } from '../../src/lib/stores/resultsStore';
import { sparqlService } from '../../src/lib/services/sparqlService';
import { queryExecutionService } from '../../src/lib/services/queryExecutionService';
import type { ProgressState } from '../../src/lib/types';

describe('Query Progress Tracking', () => {
  let progressUpdates: ProgressState[] = [];
  let unsubscribe: () => void;

  beforeEach(() => {
    progressUpdates = [];

    // Subscribe to progress updates
    unsubscribe = resultsStore.subscribe((state) => {
      if (state.progress) {
        progressUpdates.push({ ...state.progress });
      }
    });

    // Reset store
    resultsStore.reset();
  });

  afterEach(() => {
    unsubscribe();
    vi.restoreAllMocks();
  });

  describe('Progress State Transitions', () => {
    it('should track progress through execution phases', async () => {
      const responseText = JSON.stringify({
        head: { vars: ['s', 'p', 'o'] },
        results: { bindings: [] },
      });

      // Mock Blob to support text() method
      global.Blob = class MockBlob {
        constructor(public parts: any[]) {}
        text() {
          return Promise.resolve(responseText);
        }
      } as any;

      // Mock fetch to simulate slow response
      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Map([
            ['Content-Type', 'application/sparql-results+json'],
            ['Content-Length', '100'],
          ]),
          body: {
            getReader: () => ({
              read: vi.fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new Uint8Array([123, 34, 104, 101, 97, 100]), // '{"head'
                })
                .mockResolvedValueOnce({
                  done: true,
                  value: undefined,
                }),
            }),
          },
        } as any);
      });

      await queryExecutionService.executeQuery({
        endpoint: 'https://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      });

      // Should have received progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Should have seen executing phase
      const executingPhases = progressUpdates.filter((p) => p.phase === 'executing');
      expect(executingPhases.length).toBeGreaterThan(0);
    });

    it('should clear progress state after successful query', async () => {
      // Mock successful query
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([
          ['Content-Type', 'application/sparql-results+json'],
        ]),
        text: vi.fn().mockResolvedValue(JSON.stringify({
          head: { vars: ['s', 'p', 'o'] },
          results: { bindings: [] },
        })),
        body: null,
      } as any);

      await queryExecutionService.executeQuery({
        endpoint: 'https://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      });

      // Get final state
      let finalState: any;
      const unsubFinal = resultsStore.subscribe((state) => {
        finalState = state;
      });

      expect(finalState.progress).toBeUndefined();
      unsubFinal();
    });

    it('should clear progress state after query error', async () => {
      // Mock failed query
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await queryExecutionService.executeQuery({
          endpoint: 'https://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
        });
      } catch {
        // Expected to fail
      }

      // Get final state
      let finalState: any;
      const unsubFinal = resultsStore.subscribe((state) => {
        finalState = state;
      });

      expect(finalState.progress).toBeUndefined();
      unsubFinal();
    });
  });

  describe('Progress Callback Wiring', () => {
    it('should pass progress callback from queryExecutionService to sparqlService', async () => {
      const progressSpy = vi.fn();

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([
          ['Content-Type', 'application/sparql-results+json'],
        ]),
        text: vi.fn().mockResolvedValue(JSON.stringify({
          head: { vars: [] },
          results: { bindings: [] },
        })),
        body: null,
      } as any);

      // Spy on sparqlService.executeQuery
      const originalExecute = sparqlService.executeQuery.bind(sparqlService);
      vi.spyOn(sparqlService, 'executeQuery').mockImplementation(async (options) => {
        // Call progress callback if provided
        options.onProgress?.({
          phase: 'executing',
          startTime: Date.now(),
        });

        return originalExecute(options);
      });

      await queryExecutionService.executeQuery({
        endpoint: 'https://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      });

      // Should have called sparqlService with onProgress callback
      expect(sparqlService.executeQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          onProgress: expect.any(Function),
        })
      );
    });
  });

  describe('Download Progress Tracking', () => {
    it('should track bytes received during download', async () => {
      const responseText = JSON.stringify({
        head: { vars: ['s', 'p', 'o'] },
        results: { bindings: [] },
      });

      const chunk1 = new Uint8Array(50);
      const chunk2 = new Uint8Array(50);

      // Mock Blob to support text() method
      global.Blob = class MockBlob {
        constructor(public parts: any[]) {}
        text() {
          return Promise.resolve(responseText);
        }
      } as any;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([
          ['Content-Type', 'application/sparql-results+json'],
          ['Content-Length', '100'],
        ]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: chunk1 })
              .mockResolvedValueOnce({ done: false, value: chunk2 })
              .mockResolvedValueOnce({ done: true, value: undefined }),
          }),
        },
      } as any);

      await queryExecutionService.executeQuery({
        endpoint: 'https://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      });

      // Should have tracking downloading phase
      const downloadingPhases = progressUpdates.filter((p) => p.phase === 'downloading');
      expect(downloadingPhases.length).toBeGreaterThan(0);

      // Should track totalBytes from Content-Length
      const phasesWithTotal = downloadingPhases.filter((p) => p.totalBytes === 100);
      expect(phasesWithTotal.length).toBeGreaterThan(0);
    });
  });
});

describe('ResultsStore Progress Methods', () => {
  beforeEach(() => {
    resultsStore.reset();
  });

  it('should set progress state', () => {
    const progress: ProgressState = {
      phase: 'executing',
      startTime: Date.now(),
    };

    resultsStore.setProgress(progress);

    let state: any;
    const unsub = resultsStore.subscribe((s) => {
      state = s;
    });

    expect(state.progress).toEqual(progress);
    unsub();
  });

  it('should clear progress state', () => {
    const progress: ProgressState = {
      phase: 'executing',
      startTime: Date.now(),
    };

    resultsStore.setProgress(progress);
    resultsStore.clearProgress();

    let state: any;
    const unsub = resultsStore.subscribe((s) => {
      state = s;
    });

    expect(state.progress).toBeUndefined();
    unsub();
  });

  it('should update progress state multiple times', () => {
    const progress1: ProgressState = {
      phase: 'executing',
      startTime: Date.now(),
    };

    const progress2: ProgressState = {
      phase: 'downloading',
      startTime: Date.now(),
      bytesReceived: 100,
      totalBytes: 1000,
    };

    resultsStore.setProgress(progress1);
    resultsStore.setProgress(progress2);

    let state: any;
    const unsub = resultsStore.subscribe((s) => {
      state = s;
    });

    expect(state.progress).toEqual(progress2);
    unsub();
  });
});
