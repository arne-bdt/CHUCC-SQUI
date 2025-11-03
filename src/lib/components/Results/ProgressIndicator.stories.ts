/**
 * Storybook stories for ProgressIndicator component
 * STREAMING-02: Visual documentation for progress tracking UI
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import ProgressIndicator from './ProgressIndicator.svelte';
import type { ProgressState } from '../../types';

const meta = {
  title: 'Components/Results/ProgressIndicator',
  component: ProgressIndicator,
  tags: ['autodocs'],
  argTypes: {
    progress: {
      description: 'Current progress state',
      control: { type: 'object' },
    },
  },
} satisfies Meta<ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Executing phase - shows when query is being executed on the server
 */
export const Executing: Story = {
  args: {
    progress: {
      phase: 'executing',
      startTime: Date.now() - 2000, // 2 seconds ago
    } as ProgressState,
  },
};

/**
 * Executing phase with slow query warning (after 10 seconds)
 */
export const ExecutingSlow: Story = {
  args: {
    progress: {
      phase: 'executing',
      startTime: Date.now() - 12000, // 12 seconds ago
    } as ProgressState,
  },
};

/**
 * Downloading phase without known total size
 */
export const DownloadingUnknownSize: Story = {
  args: {
    progress: {
      phase: 'downloading',
      startTime: Date.now() - 1000,
      bytesReceived: 1024 * 512, // 512 KB
      downloadSpeed: 256 * 1024, // 256 KB/s
    } as ProgressState,
  },
};

/**
 * Downloading phase with known total size and progress bar
 */
export const DownloadingWithProgress: Story = {
  args: {
    progress: {
      phase: 'downloading',
      startTime: Date.now() - 3000,
      bytesReceived: 1024 * 1024 * 1.5, // 1.5 MB
      totalBytes: 1024 * 1024 * 4, // 4 MB total
      downloadSpeed: 512 * 1024, // 512 KB/s
    } as ProgressState,
  },
};

/**
 * Downloading large file
 */
export const DownloadingLargeFile: Story = {
  args: {
    progress: {
      phase: 'downloading',
      startTime: Date.now() - 5000,
      bytesReceived: 1024 * 1024 * 25, // 25 MB
      totalBytes: 1024 * 1024 * 100, // 100 MB total
      downloadSpeed: 5 * 1024 * 1024, // 5 MB/s
    } as ProgressState,
  },
};

/**
 * Downloading complete (100%)
 */
export const DownloadingComplete: Story = {
  args: {
    progress: {
      phase: 'downloading',
      startTime: Date.now() - 8000,
      bytesReceived: 1024 * 1024 * 10, // 10 MB
      totalBytes: 1024 * 1024 * 10, // 10 MB total
      downloadSpeed: 1.25 * 1024 * 1024, // 1.25 MB/s
    } as ProgressState,
  },
};

/**
 * Parsing phase without row count
 */
export const Parsing: Story = {
  args: {
    progress: {
      phase: 'parsing',
      startTime: Date.now() - 500,
    } as ProgressState,
  },
};

/**
 * Parsing phase with row count and progress
 */
export const ParsingWithProgress: Story = {
  args: {
    progress: {
      phase: 'parsing',
      startTime: Date.now() - 2000,
      rowsParsed: 15000,
      totalRows: 50000,
    } as ProgressState,
  },
};

/**
 * Parsing with memory usage information
 */
export const ParsingWithMemory: Story = {
  args: {
    progress: {
      phase: 'parsing',
      startTime: Date.now() - 1500,
      rowsParsed: 25000,
      totalRows: 100000,
      memoryUsageMB: 45.2,
    } as ProgressState,
  },
};

/**
 * Rendering phase (usually very quick)
 */
export const Rendering: Story = {
  args: {
    progress: {
      phase: 'rendering',
      startTime: Date.now() - 100,
    } as ProgressState,
  },
};

/**
 * Small download (bytes display)
 */
export const SmallDownload: Story = {
  args: {
    progress: {
      phase: 'downloading',
      startTime: Date.now() - 500,
      bytesReceived: 850, // 850 B
      totalBytes: 2048, // 2 KB
      downloadSpeed: 1700, // 1.7 KB/s
    } as ProgressState,
  },
};

/**
 * Medium download (KB display)
 */
export const MediumDownload: Story = {
  args: {
    progress: {
      phase: 'downloading',
      startTime: Date.now() - 2000,
      bytesReceived: 350 * 1024, // 350 KB
      totalBytes: 750 * 1024, // 750 KB
      downloadSpeed: 175 * 1024, // 175 KB/s
    } as ProgressState,
  },
};
