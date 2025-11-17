<script lang="ts">
  /**
   * SplitPane component - Resizable split pane layout
   * Allows users to drag a divider to resize top and bottom panes
   */

  import type { Snippet } from 'svelte';

  interface Props {
    /** Initial split ratio (0-1) - percentage of total height for top pane */
    initialSplit?: number;
    /** Minimum height for top pane in pixels */
    minTopHeight?: number;
    /** Minimum height for bottom pane in pixels */
    minBottomHeight?: number;
    /** CSS class for the container */
    class?: string;
    /** Top pane content */
    top?: Snippet;
    /** Bottom pane content */
    bottom?: Snippet;
  }

  let {
    initialSplit = 0.5,
    minTopHeight = 200,
    minBottomHeight = 150,
    class: className = '',
    top,
    bottom,
  }: Props = $props();

  // Component state
  let containerRef: HTMLDivElement | null = $state(null);
  let isDragging = $state(false);
  let splitRatio = $state(initialSplit);
  let touchStartY = $state(0);
  let touchStartRatio = $state(0);

  /**
   * Handle mouse down on splitter - start dragging
   */
  function handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    isDragging = true;
    document.body.style.userSelect = 'none'; // Prevent text selection during drag
    document.body.style.cursor = 'row-resize';
  }

  /**
   * Handle touch start on splitter - start touch dragging
   */
  function handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    isDragging = true;

    const touch = event.touches[0];
    touchStartY = touch.clientY;
    touchStartRatio = splitRatio;

    // Add touch event listeners to window
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }

  /**
   * Handle touch move - update split ratio during touch drag
   */
  function handleTouchMove(event: TouchEvent): void {
    if (!isDragging || !containerRef) return;

    const touch = event.touches[0];
    const containerRect = containerRef.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const deltaY = touch.clientY - touchStartY;
    const deltaRatio = deltaY / containerHeight;

    // Calculate new split ratio
    let newRatio = touchStartRatio + deltaRatio;

    // Enforce minimum heights
    const minTopRatio = minTopHeight / containerHeight;
    const maxTopRatio = 1 - minBottomHeight / containerHeight;

    newRatio = Math.max(minTopRatio, Math.min(maxTopRatio, newRatio));

    splitRatio = newRatio;
  }

  /**
   * Handle touch end - stop touch dragging
   */
  function handleTouchEnd(): void {
    if (!isDragging) return;
    isDragging = false;

    // Clean up touch event listeners
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }

  /**
   * Handle mouse move - update split ratio during drag
   */
  function handleMouseMove(event: MouseEvent): void {
    if (!isDragging || !containerRef) return;

    const containerRect = containerRef.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = event.clientY - containerRect.top;

    // Calculate new split ratio
    let newRatio = mouseY / containerHeight;

    // Enforce minimum heights
    const minTopRatio = minTopHeight / containerHeight;
    const maxTopRatio = 1 - minBottomHeight / containerHeight;

    newRatio = Math.max(minTopRatio, Math.min(maxTopRatio, newRatio));

    splitRatio = newRatio;
  }

  /**
   * Handle mouse up - stop dragging
   */
  function handleMouseUp(): void {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  /**
   * Handle keyboard resize - arrow keys adjust split ratio
   */
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    event.preventDefault();

    if (!containerRef) return;

    const containerHeight = containerRef.getBoundingClientRect().height;
    const increment = 0.05; // 5% adjustment per keypress

    // Calculate new split ratio
    let newRatio = event.key === 'ArrowUp'
      ? splitRatio - increment
      : splitRatio + increment;

    // Enforce minimum heights
    const minTopRatio = minTopHeight / containerHeight;
    const maxTopRatio = 1 - minBottomHeight / containerHeight;

    newRatio = Math.max(minTopRatio, Math.min(maxTopRatio, newRatio));

    splitRatio = newRatio;
  }

  // Set up and clean up mouse event listeners
  $effect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  // Clean up touch event listeners on unmount
  $effect(() => {
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  });

  // Calculate heights as percentages
  const topHeight = $derived(`${splitRatio * 100}%`);
  const bottomHeight = $derived(`${(1 - splitRatio) * 100}%`);
</script>

<div class="split-pane-container {className}" bind:this={containerRef}>
  <div class="split-pane-top" style="height: {topHeight}">
    {#if top}
      {@render top()}
    {:else}
      <div style="padding: var(--cds-spacing-05); background: var(--cds-layer-01, #f4f4f4);">Top Pane</div>
    {/if}
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="split-pane-divider-container"
    class:dragging={isDragging}
    role="separator"
    aria-orientation="horizontal"
    aria-valuenow={Math.round(splitRatio * 100)}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Resize panes. Use arrow up and arrow down keys to adjust."
    tabindex="0"
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchStart}
    onkeydown={handleKeyDown}
  >
    <div class="split-pane-divider-visible"></div>
  </div>

  <div class="split-pane-bottom" style="height: {bottomHeight}">
    {#if bottom}
      {@render bottom()}
    {:else}
      <div style="padding: var(--cds-spacing-05); background: var(--cds-layer-02, #e0e0e0);">Bottom Pane</div>
    {/if}
  </div>
</div>

<style>
  .split-pane-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .split-pane-top,
  .split-pane-bottom {
    overflow: auto;
    position: relative;
  }

  /* Divider container - 44px touch target */
  .split-pane-divider-container {
    position: relative;
    min-height: 44px; /* WCAG 2.5.5 - minimum touch target size */
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: row-resize;
    flex-shrink: 0;
  }

  /* Visual divider - thin 8px line */
  .split-pane-divider-visible {
    width: 100%;
    height: var(--cds-spacing-03); /* 8px */
    background-color: var(--cds-border-subtle, #e0e0e0);
    transition: background-color 0.2s;
    position: relative;
    pointer-events: none; /* Let container handle events */
  }

  /* Hover and dragging states */
  .split-pane-divider-container:hover .split-pane-divider-visible,
  .split-pane-divider-container.dragging .split-pane-divider-visible {
    background-color: var(--cds-border-interactive, #0f62fe);
  }

  /* Focus indicator - visible only on keyboard focus */
  .split-pane-divider-container:focus-visible {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: 2px;
  }

  /* Remove default focus outline for mouse clicks */
  .split-pane-divider-container:focus:not(:focus-visible) {
    outline: none;
  }

  /* Visual handle indicator in center of divider */
  .split-pane-divider-visible::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--cds-spacing-09); /* 48px */
    height: var(--cds-spacing-01); /* 1px */
    background-color: var(--cds-icon-secondary, #525252);
    border-radius: 2px;
  }

  .split-pane-divider-container:hover .split-pane-divider-visible::after,
  .split-pane-divider-container.dragging .split-pane-divider-visible::after {
    background-color: var(--cds-icon-on-color, #ffffff);
  }
</style>
