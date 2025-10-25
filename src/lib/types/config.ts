/**
 * Component configuration types
 */

/**
 * Carbon Design System theme names
 */
export type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';

export interface SquiConfig {
  endpoint?: string;
  theme?: CarbonTheme;
  showEndpointSelector?: boolean;
  defaultPrefixes?: Record<string, string>;
  maxRows?: number;
}

export interface EndpointConfig {
  url: string;
  name?: string;
  description?: string;
}
