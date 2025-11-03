/**
 * Unit tests for PerformanceService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceService } from '../../src/lib/services/performanceService';
import type { QueryPerformanceMetrics } from '../../src/lib/services/performanceService';

describe('PerformanceService', () => {
  let service: PerformanceService;

  beforeEach(() => {
    // Create service with logging disabled for tests
    service = new PerformanceService({ enableLogging: false });
    vi.useFakeTimers();
  });

  describe('startProfiling', () => {
    it('should create a new profiler instance', () => {
      const profiler = service.startProfiling();
      expect(profiler).toBeDefined();
      expect(profiler).toHaveProperty('markFirstByte');
      expect(profiler).toHaveProperty('markDownloadComplete');
      expect(profiler).toHaveProperty('markParseComplete');
      expect(profiler).toHaveProperty('complete');
    });
  });

  describe('recordMetrics', () => {
    it('should record metrics', () => {
      const metrics: QueryPerformanceMetrics = {
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: new Date(),
      };

      service.recordMetrics(metrics);

      const allMetrics = service.getMetrics();
      expect(allMetrics).toHaveLength(1);
      expect(allMetrics[0]).toEqual(metrics);
    });

    it('should limit stored metrics to maxStoredMetrics', () => {
      // Record 150 metrics (more than the default 100 limit)
      for (let i = 0; i < 150; i++) {
        service.recordMetrics({
          networkTime: i,
          downloadTime: i,
          parseTime: i,
          renderTime: i,
          totalTime: i * 4,
          responseBytes: 1024,
          rowCount: 10,
          columnCount: 5,
          endpoint: 'https://example.org/sparql',
          format: 'json',
          queryType: 'SELECT',
          timestamp: new Date(),
        });
      }

      const allMetrics = service.getMetrics();
      expect(allMetrics).toHaveLength(100);

      // Should keep the most recent 100
      expect(allMetrics[0].networkTime).toBe(50); // First metric after trimming
      expect(allMetrics[99].networkTime).toBe(149); // Last metric
    });
  });

  describe('getMetrics', () => {
    it('should return empty array initially', () => {
      expect(service.getMetrics()).toEqual([]);
    });

    it('should return all recorded metrics', () => {
      const metrics1: QueryPerformanceMetrics = {
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: new Date(),
      };

      const metrics2: QueryPerformanceMetrics = {
        ...metrics1,
        totalTime: 500,
      };

      service.recordMetrics(metrics1);
      service.recordMetrics(metrics2);

      const allMetrics = service.getMetrics();
      expect(allMetrics).toHaveLength(2);
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      service.recordMetrics({
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: new Date(),
      });

      expect(service.getMetrics()).toHaveLength(1);

      service.clearMetrics();

      expect(service.getMetrics()).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return null when no metrics recorded', () => {
      expect(service.getStats()).toBeNull();
    });

    it('should calculate statistics correctly', () => {
      // Record 10 metrics with predictable values
      for (let i = 1; i <= 10; i++) {
        service.recordMetrics({
          networkTime: i * 10, // 10, 20, 30, ..., 100
          downloadTime: i * 5, // 5, 10, 15, ..., 50
          parseTime: i * 2, // 2, 4, 6, ..., 20
          renderTime: i, // 1, 2, 3, ..., 10
          totalTime: i * 18, // 18, 36, 54, ..., 180
          responseBytes: i * 1024, // 1KB, 2KB, ..., 10KB
          rowCount: i * 100, // 100, 200, ..., 1000
          columnCount: 5,
          endpoint: 'https://example.org/sparql',
          format: 'json',
          queryType: 'SELECT',
          timestamp: new Date(),
          peakMemoryMB: i * 10, // 10, 20, ..., 100 MB
        });
      }

      const stats = service.getStats();
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(10);

      // Check total time stats
      expect(stats!.totalTime.min).toBe(18);
      expect(stats!.totalTime.max).toBe(180);
      expect(stats!.totalTime.avg).toBe(99); // (18+36+54+...+180)/10
      expect(stats!.totalTime.median).toBe(99); // Middle value between 5th and 6th

      // Check parse time stats
      expect(stats!.parseTime.min).toBe(2);
      expect(stats!.parseTime.max).toBe(20);
      expect(stats!.parseTime.avg).toBe(11); // (2+4+6+...+20)/10

      // Check row count stats
      expect(stats!.rowCount.min).toBe(100);
      expect(stats!.rowCount.max).toBe(1000);
      expect(stats!.rowCount.avg).toBe(550); // (100+200+...+1000)/10

      // Check memory stats
      expect(stats!.memoryUsageMB).toBeDefined();
      expect(stats!.memoryUsageMB!.min).toBe(10);
      expect(stats!.memoryUsageMB!.max).toBe(100);
      expect(stats!.memoryUsageMB!.avg).toBe(55); // (10+20+...+100)/10
    });

    it('should handle metrics without memory data', () => {
      service.recordMetrics({
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: new Date(),
        // No peakMemoryMB
      });

      const stats = service.getStats();
      expect(stats).not.toBeNull();
      expect(stats!.memoryUsageMB).toBeUndefined();
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics as CSV', () => {
      const now = new Date('2025-01-01T12:00:00Z');

      service.recordMetrics({
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: now,
        peakMemoryMB: 45.5,
        memoryGrowthMB: 10.2,
      });

      const csv = service.exportMetrics();

      // Check header row
      expect(csv).toContain(
        'timestamp,endpoint,format,queryType,totalTime,networkTime,downloadTime,parseTime,renderTime,responseBytes,rowCount,columnCount,peakMemoryMB,memoryGrowthMB'
      );

      // Check data row
      expect(csv).toContain(now.toISOString());
      expect(csv).toContain('https://example.org/sparql');
      expect(csv).toContain('json');
      expect(csv).toContain('SELECT');
      expect(csv).toContain('380.00');
      expect(csv).toContain('100.00');
      expect(csv).toContain('200.00');
      expect(csv).toContain('50.00');
      expect(csv).toContain('30.00');
      expect(csv).toContain('1024');
      expect(csv).toContain('10');
      expect(csv).toContain('5');
      expect(csv).toContain('45.50');
      expect(csv).toContain('10.20');
    });

    it('should handle missing memory data in export', () => {
      service.recordMetrics({
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: new Date(),
        // No memory data
      });

      const csv = service.exportMetrics();
      const lines = csv.split('\n');

      // Should have 2 lines (header + 1 data row)
      expect(lines).toHaveLength(2);

      // Data row should have empty values for memory fields
      const dataRow = lines[1].split(',');
      expect(dataRow[12]).toBe(''); // peakMemoryMB
      expect(dataRow[13]).toBe(''); // memoryGrowthMB
    });
  });

  describe('logging configuration', () => {
    it('should respect enableLogging configuration', () => {
      const serviceWithLogging = new PerformanceService({ enableLogging: true });
      expect(serviceWithLogging.isLoggingEnabled()).toBe(true);

      const serviceWithoutLogging = new PerformanceService({ enableLogging: false });
      expect(serviceWithoutLogging.isLoggingEnabled()).toBe(false);
    });

    it('should allow toggling logging at runtime', () => {
      const service = new PerformanceService({ enableLogging: false });
      expect(service.isLoggingEnabled()).toBe(false);

      service.setLoggingEnabled(true);
      expect(service.isLoggingEnabled()).toBe(true);

      service.setLoggingEnabled(false);
      expect(service.isLoggingEnabled()).toBe(false);
    });

    it('should not log when logging is disabled', () => {
      const consoleSpy = vi.spyOn(console, 'group');
      const service = new PerformanceService({ enableLogging: false });

      service.recordMetrics({
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: new Date(),
      });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log when logging is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'group');
      const service = new PerformanceService({ enableLogging: true });

      service.recordMetrics({
        networkTime: 100,
        downloadTime: 200,
        parseTime: 50,
        renderTime: 30,
        totalTime: 380,
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
        timestamp: new Date(),
      });

      expect(consoleSpy).toHaveBeenCalledWith('🔬 Query Performance');
      consoleSpy.mockRestore();
    });
  });

  describe('PerformanceProfiler', () => {
    it('should track timing correctly', async () => {
      const profiler = service.startProfiling();

      // Simulate network delay
      vi.advanceTimersByTime(100);
      profiler.markFirstByte();

      // Simulate download delay
      vi.advanceTimersByTime(200);
      profiler.markDownloadComplete();

      // Simulate parse delay
      vi.advanceTimersByTime(50);
      profiler.markParseComplete();

      // Simulate render delay
      vi.advanceTimersByTime(30);

      const metrics = profiler.complete({
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
      });

      expect(metrics.networkTime).toBeCloseTo(100, -1);
      expect(metrics.downloadTime).toBeCloseTo(200, -1);
      expect(metrics.parseTime).toBeCloseTo(50, -1);
      expect(metrics.renderTime).toBeCloseTo(30, -1);
      expect(metrics.totalTime).toBeCloseTo(380, -1);
    });

    it('should handle missing timing marks', () => {
      const profiler = service.startProfiling();

      vi.advanceTimersByTime(100);

      // Complete without marking any timing points
      const metrics = profiler.complete({
        responseBytes: 1024,
        rowCount: 10,
        columnCount: 5,
        endpoint: 'https://example.org/sparql',
        format: 'json',
        queryType: 'SELECT',
      });

      // Should still have valid total time
      expect(metrics.totalTime).toBeGreaterThanOrEqual(100);
      expect(metrics.networkTime).toBeGreaterThanOrEqual(100);
    });
  });
});
