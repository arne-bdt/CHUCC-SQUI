/**
 * Component configuration type definitions
 */

import type { EndpointConfig } from './sparql';

export interface SparqlQueryUIProps {
  // Endpoint configuration
  endpoint?: string;
  endpoints?: EndpointConfig[];
  showEndpointSelector?: boolean;

  // Query configuration
  defaultQuery?: string;
  defaultPrefixes?: PrefixMap;
  queryTemplates?: QueryTemplate[];

  // Result configuration
  maxRows?: number;
  chunkSize?: number;
  defaultView?: 'table' | 'raw';

  // UI configuration
  theme?: 'white' | 'g10' | 'g90' | 'g100';
  locale?: string;
  showQueryTabs?: boolean;

  // Extension hooks
  onPrefixLookup?: (endpoint: string) => Promise<PrefixMap>;
  onQueryExecute?: (query: string, endpoint: string) => void;
  onResultsReceived?: (results: any) => void;
}

export interface PrefixMap {
  [prefix: string]: string;
}

export interface QueryTemplate {
  name: string;
  description?: string;
  query: string;
}
