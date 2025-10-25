/**
 * Component configuration types
 */

export interface SquiConfig {
  endpoint?: string;
  theme?: 'white' | 'g10' | 'g90' | 'g100';
  showEndpointSelector?: boolean;
  defaultPrefixes?: Record<string, string>;
  maxRows?: number;
}

export interface EndpointConfig {
  url: string;
  name?: string;
  description?: string;
}

export type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';
