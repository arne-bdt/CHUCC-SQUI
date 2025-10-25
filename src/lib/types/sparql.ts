/**
 * SPARQL-related type definitions
 */

export interface SparqlBinding {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  'xml:lang'?: string;
  datatype?: string;
}

export interface SparqlResult {
  head: {
    vars: string[];
  };
  results: {
    bindings: Record<string, SparqlBinding>[];
  };
}

export interface AskResult {
  boolean: boolean;
}

export interface QueryOptions {
  endpoint: string;
  query: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  timeout?: number;
}

export interface EndpointConfig {
  name: string;
  url: string;
  description?: string;
}
