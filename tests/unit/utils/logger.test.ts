import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger, logPerformance, LogLevel } from '../../../src/lib/utils/logger';

describe('logger', () => {
  let originalLogLevel: number;

  beforeEach(() => {
    // Save original log level
    originalLogLevel = logger.getLevel();
  });

  afterEach(() => {
    // Restore original log level
    logger.setLevel(originalLogLevel);
  });

  it('exports logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.debug).toBeInstanceOf(Function);
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
  });

  it('allows setting log level', () => {
    logger.setLevel(LogLevel.WARN);
    expect(logger.getLevel()).toBe(logger.levels.WARN);

    logger.setLevel(LogLevel.DEBUG);
    expect(logger.getLevel()).toBe(logger.levels.DEBUG);
  });

  it('exports LogLevel constants', () => {
    expect(LogLevel.TRACE).toBe('trace');
    expect(LogLevel.DEBUG).toBe('debug');
    expect(LogLevel.INFO).toBe('info');
    expect(LogLevel.WARN).toBe('warn');
    expect(LogLevel.ERROR).toBe('error');
    expect(LogLevel.SILENT).toBe('silent');
  });

  it('logPerformance only logs in debug mode', () => {
    const consoleSpy = vi.spyOn(console, 'group');

    // Set to warn level - should not log
    logger.setLevel(LogLevel.WARN);
    logPerformance('Test', { metric: '123' });
    expect(consoleSpy).not.toHaveBeenCalled();

    // Set to debug level - should log
    logger.setLevel(LogLevel.DEBUG);
    logPerformance('Test', { metric: '123' });
    expect(consoleSpy).toHaveBeenCalledWith('🔬 Test');

    consoleSpy.mockRestore();
  });
});
