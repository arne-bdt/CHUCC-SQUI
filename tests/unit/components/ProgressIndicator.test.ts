/**
 * Unit tests for ProgressIndicator component
 * STREAMING-02: Tests for progressive UI feedback during query execution
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ProgressIndicator from '../../../src/lib/components/Results/ProgressIndicator.svelte';
import type { ProgressState } from '../../../src/lib/types';

describe('ProgressIndicator Component', () => {
  describe('Executing Phase', () => {
    it('should display executing message', () => {
      const progress: ProgressState = {
        phase: 'executing',
        startTime: Date.now() - 1000, // 1 second ago
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Executing query\.\.\./i)).toBeInTheDocument();
    });

    it('should show elapsed time', () => {
      const progress: ProgressState = {
        phase: 'executing',
        startTime: Date.now() - 2500, // 2.5 seconds ago
      };

      render(ProgressIndicator, { props: { progress } });

      // Should show approximately 2.5s (allowing for small time drift)
      expect(screen.getByText(/Executing query\.\.\. \d+\.\d+s/i)).toBeInTheDocument();
    });

    it('should show warning after 10 seconds', () => {
      const progress: ProgressState = {
        phase: 'executing',
        startTime: Date.now() - 11000, // 11 seconds ago
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Query is taking longer than usual/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not show warning before 10 seconds', () => {
      const progress: ProgressState = {
        phase: 'executing',
        startTime: Date.now() - 9000, // 9 seconds ago
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.queryByText(/Query is taking longer than usual/i)).not.toBeInTheDocument();
    });
  });

  describe('Downloading Phase', () => {
    it('should display downloading message with bytes received when total is unknown', () => {
      const progress: ProgressState = {
        phase: 'downloading',
        startTime: Date.now(),
        bytesReceived: 1024 * 512, // 512 KB
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Receiving response\.\.\. 512\.0 KB received/i)).toBeInTheDocument();
    });

    it('should display downloading message with percentage when total is known', () => {
      const progress: ProgressState = {
        phase: 'downloading',
        startTime: Date.now(),
        bytesReceived: 1024 * 1024, // 1 MB
        totalBytes: 1024 * 1024 * 4, // 4 MB total
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Receiving response\.\.\. 1\.0 MB \/ 4\.0 MB \(25%\)/i)).toBeInTheDocument();
    });

    it('should display progress bar when total bytes is known', () => {
      const progress: ProgressState = {
        phase: 'downloading',
        startTime: Date.now(),
        bytesReceived: 1024 * 1024 * 2, // 2 MB
        totalBytes: 1024 * 1024 * 4, // 4 MB total
      };

      const { container } = render(ProgressIndicator, { props: { progress } });

      expect(container.querySelector('.progress-bar-container')).toBeInTheDocument();
    });

    it('should display download speed', () => {
      const progress: ProgressState = {
        phase: 'downloading',
        startTime: Date.now(),
        bytesReceived: 1024 * 1024 * 2, // 2 MB
        totalBytes: 1024 * 1024 * 4, // 4 MB total
        downloadSpeed: 256 * 1024, // 256 KB/s
      };

      render(ProgressIndicator, { props: { progress } });

      // Should show speed in helper text or stats
      expect(screen.getByText(/256 KB\/s/i)).toBeInTheDocument();
    });

    it('should format bytes correctly for small sizes', () => {
      const progress: ProgressState = {
        phase: 'downloading',
        startTime: Date.now(),
        bytesReceived: 512, // 512 B
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/512 B received/i)).toBeInTheDocument();
    });

    it('should format bytes correctly for MB sizes', () => {
      const progress: ProgressState = {
        phase: 'downloading',
        startTime: Date.now(),
        bytesReceived: 1024 * 1024 * 2.5, // 2.5 MB
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/2\.5 MB received/i)).toBeInTheDocument();
    });
  });

  describe('Parsing Phase', () => {
    it('should display parsing message with elapsed time', () => {
      const progress: ProgressState = {
        phase: 'parsing',
        startTime: Date.now() - 1500, // 1.5 seconds ago
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Parsing results\.\.\. \d+\.\d+s/i)).toBeInTheDocument();
    });

    it('should display parsing message with row count when available', () => {
      const progress: ProgressState = {
        phase: 'parsing',
        startTime: Date.now(),
        totalRows: 25000,
        rowsParsed: 12500,
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Parsing 25,000 results\.\.\. 50%/i)).toBeInTheDocument();
    });
  });

  describe('Rendering Phase', () => {
    it('should display rendering message', () => {
      const progress: ProgressState = {
        phase: 'rendering',
        startTime: Date.now(),
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Rendering results\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const progress: ProgressState = {
        phase: 'executing',
        startTime: Date.now(),
      };

      const { container } = render(ProgressIndicator, { props: { progress } });

      const progressElement = container.querySelector('.progress-indicator');
      expect(progressElement).toHaveAttribute('role', 'status');
      expect(progressElement).toHaveAttribute('aria-live', 'polite');
      expect(progressElement).toHaveAttribute('aria-atomic', 'true');
    });

    it('should mark warning as alert', () => {
      const progress: ProgressState = {
        phase: 'executing',
        startTime: Date.now() - 11000, // 11 seconds
      };

      const { container } = render(ProgressIndicator, { props: { progress } });

      const warning = container.querySelector('.warning');
      expect(warning).toHaveAttribute('role', 'alert');
    });
  });

  describe('Memory Usage', () => {
    it('should display memory usage when available', () => {
      const progress: ProgressState = {
        phase: 'parsing',
        startTime: Date.now(),
        memoryUsageMB: 45.2,
      };

      render(ProgressIndicator, { props: { progress } });

      expect(screen.getByText(/Memory usage: 45\.2 MB/i)).toBeInTheDocument();
    });
  });
});
