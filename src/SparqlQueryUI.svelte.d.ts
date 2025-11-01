/**
   * SPARQL Query UI Component
   *
   * A modern, web-based SPARQL query interface built with Svelte 5 and Carbon Design System.
   * Provides a complete interface for composing, executing, and visualizing SPARQL queries.
   *
   * @component
   * @example
   * ```svelte
   * <SparqlQueryUI
   *   endpoint={{ url: "https://dbpedia.org/sparql" }}
   *   theme={{ theme: "g90" }}
   *   limits={{ maxRows: 10000 }}
   * />
   * ```
   */
import type { SquiConfig } from './lib/types';
/**
 * Component props interface
 * All configuration options are optional with sensible defaults
 */
interface Props extends SquiConfig {
}
declare const SparqlQueryUI: import("svelte").Component<Props, {}, "">;
type SparqlQueryUI = ReturnType<typeof SparqlQueryUI>;
export default SparqlQueryUI;
