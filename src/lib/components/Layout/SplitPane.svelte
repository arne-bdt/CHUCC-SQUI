<script lang="ts">
  /**
   * SplitPane component - Resizable split pane layout
   * Allows users to drag a divider to resize top and bottom panes
   */

  interface Props {
    /** Initial split ratio (0-1) - percentage of total height for top pane */
    initialSplit?: number;
    /** Minimum height for top pane in pixels */
    minTopHeight?: number;
    /** Minimum height for bottom pane in pixels */
    minBottomHeight?: number;
    /** CSS class for the container */
    class?: string;
  }

  let {
    initialSplit = 0.5,
    minTopHeight = 200,
    minBottomHeight = 150,
    class: className = '',
  }: Props = $props();

  // Component state
  let containerRef: HTMLDivElement | null = $state(null);
  let isDragging = $state(false);
  let splitRatio = $state(initialSplit);

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

  // Calculate heights as percentages
  const topHeight = $derived(`${splitRatio * 100}%`);
  const bottomHeight = $derived(`${(1 - splitRatio) * 100}%`);
</script>

<div class="split-pane-container {className}" bind:this={containerRef}>
  <div class="split-pane-top" style="height: {topHeight}">
    <slot name="top" />
  </div>

  <div
    class="split-pane-divider"
    class:dragging={isDragging}
    role="separator"
    aria-orientation="horizontal"
    aria-valuenow={Math.round(splitRatio * 100)}
    tabindex="0"
    onmousedown={handleMouseDown}
  ></div>

  <div class="split-pane-bottom" style="height: {bottomHeight}">
    <slot name="bottom" />
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

  .split-pane-divider {
    height: 6px;
    background-color: var(--cds-border-subtle, #e0e0e0);
    cursor: row-resize;
    flex-shrink: 0;
    transition: background-color 0.2s;
    position: relative;
  }

  .split-pane-divider:hover,
  .split-pane-divider.dragging {
    background-color: var(--cds-border-interactive, #0f62fe);
  }

  .split-pane-divider:focus {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: -2px;
  }

  /* Add a subtle visual indicator */
  .split-pane-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 2px;
    background-color: var(--cds-icon-secondary, #525252);
    border-radius: 1px;
  }

  .split-pane-divider:hover::after,
  .split-pane-divider.dragging::after {
    background-color: var(--cds-icon-on-color, #ffffff);
  }
</style>
