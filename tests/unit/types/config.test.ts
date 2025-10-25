import { describe, it, expect } from 'vitest';
import type {
  SquiConfig,
  EndpointConfig,
  Endpoint,
  PrefixConfig,
  ThemeConfig,
  LocalizationConfig,
  FeatureFlags,
  LimitsConfig,
  CarbonTheme,
} from '../../../src/lib/types';

describe('Configuration Types', () => {
  describe('CarbonTheme', () => {
    it('should accept valid theme values', () => {
      const themes: CarbonTheme[] = ['white', 'g10', 'g90', 'g100'];
      expect(themes).toHaveLength(4);
      expect(themes).toContain('white');
      expect(themes).toContain('g10');
      expect(themes).toContain('g90');
      expect(themes).toContain('g100');
    });
  });

  describe('Endpoint', () => {
    it('should create valid endpoint with required fields', () => {
      const endpoint: Endpoint = {
        url: 'https://dbpedia.org/sparql',
        name: 'DBpedia',
      };

      expect(endpoint.url).toBe('https://dbpedia.org/sparql');
      expect(endpoint.name).toBe('DBpedia');
    });

    it('should create endpoint with optional description', () => {
      const endpoint: Endpoint = {
        url: 'https://query.wikidata.org/sparql',
        name: 'Wikidata',
        description: 'Wikidata SPARQL endpoint',
      };

      expect(endpoint.description).toBe('Wikidata SPARQL endpoint');
    });
  });

  describe('EndpointConfig', () => {
    it('should create empty endpoint config', () => {
      const config: EndpointConfig = {};
      expect(config).toBeDefined();
    });

    it('should create endpoint config with URL', () => {
      const config: EndpointConfig = {
        url: 'https://dbpedia.org/sparql',
      };

      expect(config.url).toBe('https://dbpedia.org/sparql');
    });

    it('should create endpoint config with catalogue', () => {
      const config: EndpointConfig = {
        catalogue: [
          { url: 'https://dbpedia.org/sparql', name: 'DBpedia' },
          { url: 'https://query.wikidata.org/sparql', name: 'Wikidata' },
        ],
      };

      expect(config.catalogue).toHaveLength(2);
      expect(config.catalogue?.[0].name).toBe('DBpedia');
    });

    it('should allow hiding endpoint selector', () => {
      const config: EndpointConfig = {
        url: 'https://example.com/sparql',
        hideSelector: true,
      };

      expect(config.hideSelector).toBe(true);
    });
  });

  describe('PrefixConfig', () => {
    it('should create prefix config with defaults', () => {
      const config: PrefixConfig = {
        default: {
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        },
      };

      expect(config.default).toBeDefined();
      expect(config.default?.rdf).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    });

    it('should allow discovery hook function', () => {
      const discoveryHook = async (endpoint: string): Promise<Record<string, string>> => {
        return { test: 'http://example.com/' };
      };

      const config: PrefixConfig = {
        discoveryHook,
      };

      expect(config.discoveryHook).toBeDefined();
      expect(typeof config.discoveryHook).toBe('function');
    });
  });

  describe('ThemeConfig', () => {
    it('should create theme config', () => {
      const config: ThemeConfig = {
        theme: 'g90',
      };

      expect(config.theme).toBe('g90');
    });
  });

  describe('LocalizationConfig', () => {
    it('should create localization config with locale', () => {
      const config: LocalizationConfig = {
        locale: 'en',
      };

      expect(config.locale).toBe('en');
    });

    it('should create localization config with custom strings', () => {
      const config: LocalizationConfig = {
        locale: 'de',
        strings: {
          'button.run': 'Ausführen',
          'button.cancel': 'Abbrechen',
        },
      };

      expect(config.strings?.['button.run']).toBe('Ausführen');
    });
  });

  describe('FeatureFlags', () => {
    it('should create feature flags', () => {
      const flags: FeatureFlags = {
        enableTabs: true,
        enableFilters: false,
        enableDownloads: true,
      };

      expect(flags.enableTabs).toBe(true);
      expect(flags.enableFilters).toBe(false);
      expect(flags.enableDownloads).toBe(true);
    });

    it('should allow all features enabled', () => {
      const flags: FeatureFlags = {
        enableTabs: true,
        enableFilters: true,
        enableDownloads: true,
        enableSharing: true,
        enableHistory: true,
      };

      expect(Object.values(flags).every((v) => v === true)).toBe(true);
    });
  });

  describe('LimitsConfig', () => {
    it('should create limits config', () => {
      const config: LimitsConfig = {
        maxRows: 10000,
        chunkSize: 1000,
        timeout: 30000,
      };

      expect(config.maxRows).toBe(10000);
      expect(config.chunkSize).toBe(1000);
      expect(config.timeout).toBe(30000);
    });
  });

  describe('SquiConfig', () => {
    it('should create empty config', () => {
      const config: SquiConfig = {};
      expect(config).toBeDefined();
    });

    it('should create full config', () => {
      const config: SquiConfig = {
        endpoint: {
          url: 'https://dbpedia.org/sparql',
        },
        prefixes: {
          default: {
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          },
        },
        theme: {
          theme: 'g90',
        },
        localization: {
          locale: 'en',
        },
        features: {
          enableTabs: true,
          enableDownloads: true,
        },
        limits: {
          maxRows: 5000,
          timeout: 15000,
        },
      };

      expect(config.endpoint?.url).toBe('https://dbpedia.org/sparql');
      expect(config.theme?.theme).toBe('g90');
      expect(config.limits?.maxRows).toBe(5000);
    });
  });
});
