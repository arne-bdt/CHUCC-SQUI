/**
 * Standalone Wrapper for SQUI
 *
 * Provides a Svelte 4-style mounting API for the Svelte 5 runes-based component.
 * This wrapper allows standalone HTML files to mount the component using the familiar
 * `new Component({ target, props })` pattern.
 */

import SparqlQueryUI from './SparqlQueryUI.svelte';
import { mount, unmount } from 'svelte';

/**
 * Wrapper class that provides Svelte 4-style mounting API
 */
class SparqlQueryUIWrapper {
  #instance = null;
  #target = null;

  constructor(options) {
    if (!options || !options.target) {
      throw new Error('Missing required option: target');
    }

    this.#target = options.target;
    const props = options.props || {};

    // Use Svelte 5's mount() function
    this.#instance = mount(SparqlQueryUI, {
      target: this.#target,
      props
    });
  }

  /**
   * Destroy the component instance
   */
  $destroy() {
    if (this.#instance) {
      unmount(this.#instance);
      this.#instance = null;
    }
  }

  /**
   * Update component props (Svelte 5 runes are automatically reactive)
   * @param {Object} props - New props to set
   */
  $set(props) {
    // In Svelte 5 with runes, props are automatically reactive
    // This method is kept for API compatibility but may not work as expected
    console.warn('$set() is not fully supported in Svelte 5 runes mode');
  }
}

export default SparqlQueryUIWrapper;
