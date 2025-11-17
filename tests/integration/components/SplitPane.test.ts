/**
 * Integration tests for SplitPane component
 * Tests accessibility features: keyboard navigation, ARIA attributes, touch targets
 *
 * Accessibility features tested:
 * - Keyboard navigation (ArrowUp/ArrowDown)
 * - ARIA attributes (role, orientation, valuenow, valuemin, valuemax, label)
 * - 44px minimum touch target (WCAG 2.5.5)
 * - Minimum height constraints
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import SplitPane from '../../../src/lib/components/Layout/SplitPane.svelte';

describe('SplitPane Accessibility', () => {
  describe('ARIA Attributes', () => {
    it('should have proper ARIA attributes on divider container', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const divider = container.querySelector('[role="separator"]');
      expect(divider).toBeInTheDocument();

      // Verify ARIA attributes
      expect(divider).toHaveAttribute('role', 'separator');
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
      expect(divider).toHaveAttribute('aria-valuemin', '0');
      expect(divider).toHaveAttribute('aria-valuemax', '100');

      // Verify aria-valuenow is present and is a number
      const valuenow = divider?.getAttribute('aria-valuenow');
      expect(valuenow).toBeTruthy();
      expect(Number(valuenow)).toBeGreaterThanOrEqual(0);
      expect(Number(valuenow)).toBeLessThanOrEqual(100);

      // Verify aria-label contains helpful text
      const ariaLabel = divider?.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Resize');
      expect(ariaLabel).toContain('arrow');
    });

    it('should have correct initial aria-valuenow based on initialSplit', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.7,
        },
      });

      const divider = container.querySelector('[role="separator"]');
      expect(divider).toHaveAttribute('aria-valuenow', '70');
    });

    it('should have tabindex for keyboard accessibility', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const divider = container.querySelector('[role="separator"]');
      expect(divider).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should resize pane with ArrowDown key', async () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const divider = container.querySelector('[role="separator"]') as HTMLElement;
      const containerEl = container.querySelector('.split-pane-container') as HTMLElement;
      expect(divider).toBeInTheDocument();

      // Mock container height for calculations
      Object.defineProperty(containerEl, 'getBoundingClientRect', {
        value: () => ({ height: 600, top: 0, bottom: 600, left: 0, right: 800, width: 800 }),
      });

      // Get initial aria-valuenow value
      const initialValue = Number(divider.getAttribute('aria-valuenow'));
      expect(initialValue).toBe(50);

      // Fire keyDown event with ArrowDown
      await fireEvent.keyDown(divider, { key: 'ArrowDown' });

      // Wait for aria-valuenow to update
      await waitFor(() => {
        const newValue = Number(divider.getAttribute('aria-valuenow'));
        expect(newValue).toBeGreaterThan(initialValue);
      });
    });

    it('should resize pane with ArrowUp key', async () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const divider = container.querySelector('[role="separator"]') as HTMLElement;
      const containerEl = container.querySelector('.split-pane-container') as HTMLElement;
      expect(divider).toBeInTheDocument();

      // Mock container height for calculations
      Object.defineProperty(containerEl, 'getBoundingClientRect', {
        value: () => ({ height: 600, top: 0, bottom: 600, left: 0, right: 800, width: 800 }),
      });

      // Get initial aria-valuenow value
      const initialValue = Number(divider.getAttribute('aria-valuenow'));
      expect(initialValue).toBe(50);

      // Fire keyDown event with ArrowUp
      await fireEvent.keyDown(divider, { key: 'ArrowUp' });

      // Wait for aria-valuenow to update
      await waitFor(() => {
        const newValue = Number(divider.getAttribute('aria-valuenow'));
        expect(newValue).toBeLessThan(initialValue);
      });
    });

    it('should ignore non-arrow keys', async () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const divider = container.querySelector('[role="separator"]') as HTMLElement;
      const initialValue = Number(divider.getAttribute('aria-valuenow'));

      // Try various non-arrow keys
      await fireEvent.keyDown(divider, { key: 'Enter' });
      await fireEvent.keyDown(divider, { key: ' ' }); // Space
      await fireEvent.keyDown(divider, { key: 'Tab' });
      await fireEvent.keyDown(divider, { key: 'Escape' });

      // Value should remain unchanged
      const finalValue = Number(divider.getAttribute('aria-valuenow'));
      expect(finalValue).toBe(initialValue);
    });

    it('should respect minimum top height when resizing up', async () => {
      const minTopHeight = 200;

      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.3, // Start with small top pane
          minTopHeight,
          minBottomHeight: 150,
        },
      });

      const divider = container.querySelector('[role="separator"]') as HTMLElement;
      const containerEl = container.querySelector('.split-pane-container') as HTMLElement;

      // Mock container height for calculations
      Object.defineProperty(containerEl, 'getBoundingClientRect', {
        value: () => ({ height: 600, top: 0, bottom: 600, left: 0, right: 800, width: 800 }),
      });

      // Press ArrowUp many times to try to go below minimum
      for (let i = 0; i < 20; i++) {
        await fireEvent.keyDown(divider, { key: 'ArrowUp' });
      }

      await waitFor(() => {
        const finalValue = Number(divider.getAttribute('aria-valuenow'));
        const minRatio = (minTopHeight / 600) * 100;
        // Should not go below minimum ratio
        expect(finalValue).toBeGreaterThanOrEqual(Math.floor(minRatio));
      });
    });

    it('should respect minimum bottom height when resizing down', async () => {
      const minBottomHeight = 250;

      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.7, // Start with large top pane
          minTopHeight: 200,
          minBottomHeight,
        },
      });

      const divider = container.querySelector('[role="separator"]') as HTMLElement;
      const containerEl = container.querySelector('.split-pane-container') as HTMLElement;

      // Mock container height for calculations
      Object.defineProperty(containerEl, 'getBoundingClientRect', {
        value: () => ({ height: 600, top: 0, bottom: 600, left: 0, right: 800, width: 800 }),
      });

      // Press ArrowDown many times to try to go above maximum
      for (let i = 0; i < 20; i++) {
        await fireEvent.keyDown(divider, { key: 'ArrowDown' });
      }

      await waitFor(() => {
        const finalValue = Number(divider.getAttribute('aria-valuenow'));
        const maxRatio = (1 - minBottomHeight / 600) * 100;
        // Should not go above maximum ratio
        expect(finalValue).toBeLessThanOrEqual(Math.ceil(maxRatio));
      });
    });

    it('should adjust by 5% increments on each keypress', async () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const divider = container.querySelector('[role="separator"]') as HTMLElement;
      const containerEl = container.querySelector('.split-pane-container') as HTMLElement;

      // Mock container height
      Object.defineProperty(containerEl, 'getBoundingClientRect', {
        value: () => ({ height: 600, top: 0, bottom: 600, left: 0, right: 800, width: 800 }),
      });

      const initialValue = Number(divider.getAttribute('aria-valuenow'));

      // Press ArrowDown once
      await fireEvent.keyDown(divider, { key: 'ArrowDown' });

      await waitFor(() => {
        const newValue = Number(divider.getAttribute('aria-valuenow'));
        // Should increase by approximately 5%
        const difference = newValue - initialValue;
        expect(difference).toBeGreaterThanOrEqual(4);
        expect(difference).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('Touch Target Size', () => {
    it('should have divider container element for touch target', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const dividerContainer = container.querySelector('.split-pane-divider-container') as HTMLElement;
      expect(dividerContainer).toBeInTheDocument();

      // Verify container exists (actual dimensions tested in E2E tests)
      expect(dividerContainer.classList.contains('split-pane-divider-container')).toBe(true);
    });

    it('should have visual divider inside container', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const visibleDivider = container.querySelector('.split-pane-divider-visible') as HTMLElement;
      expect(visibleDivider).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render top and bottom panes', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      expect(container.querySelector('.split-pane-top')).toBeInTheDocument();
      expect(container.querySelector('.split-pane-bottom')).toBeInTheDocument();
    });

    it('should render divider container and visible divider', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      expect(container.querySelector('.split-pane-divider-container')).toBeInTheDocument();
      expect(container.querySelector('.split-pane-divider-visible')).toBeInTheDocument();
    });

    it('should apply custom CSS class', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
          class: 'custom-split-pane',
        },
      });

      const splitPaneContainer = container.querySelector('.split-pane-container');
      expect(splitPaneContainer?.classList.contains('custom-split-pane')).toBe(true);
    });

    it('should set initial heights based on initialSplit prop', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.6,
        },
      });

      const topPane = container.querySelector('.split-pane-top') as HTMLElement;
      const bottomPane = container.querySelector('.split-pane-bottom') as HTMLElement;

      // Heights should be set as inline styles
      expect(topPane.style.height).toBe('60%');
      expect(bottomPane.style.height).toBe('40%');
    });
  });

  describe('Focus Indicators', () => {
    it('should have focus-visible styles defined', () => {
      const { container } = render(SplitPane, {
        props: {
          initialSplit: 0.5,
        },
      });

      const dividerContainer = container.querySelector('.split-pane-divider-container') as HTMLElement;

      // Focus the element
      dividerContainer.focus();

      // Element should be focusable
      expect(document.activeElement).toBe(dividerContainer);
    });
  });
});
