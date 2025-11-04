/**
 * SPARQL Service Description Service
 * Fetches and parses SPARQL Service Description metadata from endpoints
 * @see https://www.w3.org/TR/sparql11-service-description/
 */

import { Parser, Store, DataFactory, type Quad } from 'n3';
import type {
  ServiceDescription,
  SPARQLLanguage,
  ServiceFeature,
  Dataset,
  GraphDescription,
  NamedGraph,
  ExtensionFunction,
  ExtensionAggregate,
  ResultFormat,
  InputFormat,
} from '../types';

const { namedNode } = DataFactory;

/**
 * Service Description vocabulary namespace
 */
const SD = 'http://www.w3.org/ns/sparql-service-description#';

/**
 * RDF vocabulary namespace
 */
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * RDFS vocabulary namespace
 */
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';

/**
 * Supported RDF content types for service description
 * N3.js supports: Turtle, N-Triples, N-Quads, and TriG
 * Note: RDF/XML and JSON-LD are NOT supported by N3.js
 */
const SUPPORTED_RDF_FORMATS = [
  'text/turtle',
  'application/n-triples',
  'application/n-quads',
  'application/trig',
];

/**
 * Error thrown when service description operations fail
 */
export class ServiceDescriptionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'ServiceDescriptionError';
  }
}

/**
 * SPARQL Service Description Service
 * Provides methods to fetch and parse service descriptions from SPARQL endpoints
 */
export class ServiceDescriptionService {
  private defaultTimeout = 10000; // 10 seconds for service description fetch

  /**
   * Fetch and parse service description from endpoint
   * @param endpointUrl SPARQL endpoint URL
   * @param timeout Request timeout in milliseconds (default: 10000)
   * @returns Service description or null if not available
   * @throws ServiceDescriptionError on fetch or parse failures
   */
  async fetchServiceDescription(
    endpointUrl: string,
    timeout = this.defaultTimeout,
  ): Promise<ServiceDescription | null> {
    try {
      // Check if endpoint supports service description first
      const supported = await this.supportsServiceDescription(endpointUrl, timeout);
      if (!supported) {
        return this.createUnavailableDescription(endpointUrl);
      }

      // Fetch service description RDF data
      const { data, contentType } = await this.fetchRdfData(endpointUrl, timeout);

      // Parse RDF data
      const description = await this.parseServiceDescription(data, contentType, endpointUrl);

      return description;
    } catch (error) {
      if (error instanceof ServiceDescriptionError) {
        throw error;
      }
      throw new ServiceDescriptionError(
        `Failed to fetch service description from ${endpointUrl}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Check if endpoint supports service description
   * Performs lightweight check before full fetch
   * @param endpointUrl SPARQL endpoint URL
   * @param timeout Request timeout in milliseconds
   * @returns true if endpoint supports service description
   */
  async supportsServiceDescription(
    endpointUrl: string,
    timeout = this.defaultTimeout,
  ): Promise<boolean> {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeout);

      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          Accept: SUPPORTED_RDF_FORMATS.join(', '),
        },
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      // Check if response has RDF content type
      const contentType = response.headers.get('content-type') || '';
      return (
        response.ok && SUPPORTED_RDF_FORMATS.some((format) => contentType.includes(format))
      );
    } catch (error) {
      // Endpoint doesn't support service description
      return false;
    }
  }

  /**
   * Fetch RDF data from endpoint
   * @param endpointUrl SPARQL endpoint URL
   * @param timeout Request timeout in milliseconds
   * @returns RDF data and content type
   * @throws ServiceDescriptionError on fetch failure
   */
  private async fetchRdfData(
    endpointUrl: string,
    timeout: number,
  ): Promise<{ data: string; contentType: string }> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    try {
      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          Accept: SUPPORTED_RDF_FORMATS.join(', '),
        },
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ServiceDescriptionError(
          `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.text();
      const contentType = response.headers.get('content-type') || 'text/turtle';

      return { data, contentType };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ServiceDescriptionError) {
        throw error;
      }
      throw new ServiceDescriptionError(
        `Failed to fetch RDF data: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Parse RDF service description from response
   * Supports Turtle, N-Triples, N-Quads, and TriG formats
   * Note: RDF/XML and JSON-LD are NOT supported (limitation of N3.js parser)
   * @param rdfData RDF data string
   * @param contentType Content type of the RDF data
   * @param endpointUrl Endpoint URL for the description
   * @returns Parsed service description
   * @throws ServiceDescriptionError on parse failure
   */
  async parseServiceDescription(
    rdfData: string,
    contentType: string,
    endpointUrl: string,
  ): Promise<ServiceDescription> {
    try {
      // Determine RDF format from content type
      const format = this.getRdfFormat(contentType);

      // Parse RDF data into store
      const store = await this.parseRdf(rdfData, format);

      // Extract service description from store
      return this.extractServiceDescription(store, endpointUrl);
    } catch (error) {
      throw new ServiceDescriptionError(
        `Failed to parse service description: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Parse RDF data into N3 store
   * @param rdfData RDF data string
   * @param format RDF format (turtle, rdfxml, jsonld, ntriples, nquads)
   * @returns N3 store with parsed triples
   */
  private async parseRdf(rdfData: string, format: string): Promise<Store> {
    return new Promise((resolve, reject) => {
      const parser = new Parser({ format });
      const store = new Store();

      parser.parse(rdfData, (error, quad, prefixes) => {
        if (error) {
          reject(error);
        } else if (quad) {
          store.addQuad(quad);
        } else {
          // Parsing complete
          resolve(store);
        }
      });
    });
  }

  /**
   * Extract service description from RDF store
   * @param store N3 store with parsed triples
   * @param endpointUrl Endpoint URL
   * @returns Service description
   */
  private extractServiceDescription(store: Store, endpointUrl: string): ServiceDescription {
    // Find sd:Service resources
    const services = store.getSubjects(
      namedNode(`${RDF}type`),
      namedNode(`${SD}Service`),
      null,
    );

    // Use first service or create default
    const serviceNode = services[0] || namedNode(endpointUrl);

    // Extract supported languages
    const supportedLanguages = this.extractSupportedLanguages(store, serviceNode);

    // Extract features
    const features = this.extractFeatures(store, serviceNode);

    // Extract result formats
    const resultFormats = this.extractFormats(store, serviceNode, 'resultFormat');

    // Extract input formats
    const inputFormats = this.extractFormats(store, serviceNode, 'inputFormat');

    // Extract extension functions
    const extensionFunctions = this.extractExtensionFunctions(store, serviceNode);

    // Extract extension aggregates
    const extensionAggregates = this.extractExtensionAggregates(store, serviceNode);

    // Extract datasets
    const datasets = this.extractDatasets(store, serviceNode);

    return {
      endpoint: endpointUrl,
      supportedLanguages,
      features,
      resultFormats,
      inputFormats,
      extensionFunctions,
      extensionAggregates,
      datasets,
      lastFetched: new Date(),
      available: true,
    };
  }

  /**
   * Extract supported SPARQL languages
   */
  private extractSupportedLanguages(store: Store, serviceNode: Quad['subject']): SPARQLLanguage[] {
    const languages: SPARQLLanguage[] = [];
    const languageQuads = store.getQuads(
      serviceNode,
      namedNode(`${SD}supportedLanguage`),
      null,
      null,
    );

    for (const quad of languageQuads) {
      const language = quad.object.value as SPARQLLanguage;
      languages.push(language);
    }

    return languages;
  }

  /**
   * Extract service features
   */
  private extractFeatures(store: Store, serviceNode: Quad['subject']): ServiceFeature[] {
    const features: ServiceFeature[] = [];
    const featureQuads = store.getQuads(serviceNode, namedNode(`${SD}feature`), null, null);

    for (const quad of featureQuads) {
      const feature = quad.object.value as ServiceFeature;
      features.push(feature);
    }

    return features;
  }

  /**
   * Extract formats (result or input)
   */
  private extractFormats(
    store: Store,
    serviceNode: Quad['subject'],
    formatType: 'resultFormat' | 'inputFormat',
  ): (ResultFormat | InputFormat)[] {
    const formats: string[] = [];
    const formatQuads = store.getQuads(
      serviceNode,
      namedNode(`${SD}${formatType}`),
      null,
      null,
    );

    for (const quad of formatQuads) {
      formats.push(quad.object.value);
    }

    return formats;
  }

  /**
   * Extract extension functions
   */
  private extractExtensionFunctions(
    store: Store,
    serviceNode: Quad['subject'],
  ): ExtensionFunction[] {
    const functions: ExtensionFunction[] = [];
    const functionQuads = store.getQuads(
      serviceNode,
      namedNode(`${SD}extensionFunction`),
      null,
      null,
    );

    for (const quad of functionQuads) {
      const uri = quad.object.value;
      const label = this.extractLabel(store, quad.object);
      const comment = this.extractComment(store, quad.object);

      functions.push({ uri, label, comment });
    }

    return functions;
  }

  /**
   * Extract extension aggregates
   */
  private extractExtensionAggregates(
    store: Store,
    serviceNode: Quad['subject'],
  ): ExtensionAggregate[] {
    const aggregates: ExtensionAggregate[] = [];
    const aggregateQuads = store.getQuads(
      serviceNode,
      namedNode(`${SD}extensionAggregate`),
      null,
      null,
    );

    for (const quad of aggregateQuads) {
      const uri = quad.object.value;
      const label = this.extractLabel(store, quad.object);
      const comment = this.extractComment(store, quad.object);

      aggregates.push({ uri, label, comment });
    }

    return aggregates;
  }

  /**
   * Extract datasets
   */
  private extractDatasets(store: Store, serviceNode: Quad['subject']): Dataset[] {
    const datasets: Dataset[] = [];
    const datasetQuads = store.getQuads(
      serviceNode,
      namedNode(`${SD}defaultDataset`),
      null,
      null,
    );

    for (const quad of datasetQuads) {
      const datasetNode = quad.object;
      const dataset = this.extractDataset(store, datasetNode);
      datasets.push(dataset);
    }

    // If no datasets found, return empty array
    return datasets;
  }

  /**
   * Extract a single dataset
   */
  private extractDataset(store: Store, datasetNode: Quad['object']): Dataset {
    const uri = datasetNode.value;

    // Extract default graphs
    const defaultGraphs = this.extractGraphs(store, datasetNode, 'defaultGraph');

    // Extract named graphs
    const namedGraphQuads = store.getQuads(
      datasetNode,
      namedNode(`${SD}namedGraph`),
      null,
      null,
    );
    const namedGraphs: NamedGraph[] = [];

    for (const quad of namedGraphQuads) {
      const graphNode = quad.object;
      const graphDescription = this.extractGraph(store, graphNode);

      // Extract graph name
      const nameQuads = store.getQuads(graphNode, namedNode(`${SD}name`), null, null);
      const name = nameQuads[0]?.object.value || graphNode.value;

      namedGraphs.push({ ...graphDescription, name });
    }

    return {
      uri: uri !== datasetNode.value ? uri : undefined,
      defaultGraphs,
      namedGraphs,
    };
  }

  /**
   * Extract graph descriptions
   */
  private extractGraphs(
    store: Store,
    datasetNode: Quad['object'],
    graphType: 'defaultGraph' | 'namedGraph',
  ): GraphDescription[] {
    const graphs: GraphDescription[] = [];
    const graphQuads = store.getQuads(datasetNode, namedNode(`${SD}${graphType}`), null, null);

    for (const quad of graphQuads) {
      const graphNode = quad.object;
      const graph = this.extractGraph(store, graphNode);
      graphs.push(graph);
    }

    return graphs;
  }

  /**
   * Extract a single graph description
   */
  private extractGraph(store: Store, graphNode: Quad['object']): GraphDescription {
    const uri = graphNode.value;

    // Extract entailment regime
    const entailmentQuads = store.getQuads(
      graphNode,
      namedNode(`${SD}entailmentRegime`),
      null,
      null,
    );
    const entailmentRegime = entailmentQuads[0]?.object.value;

    // Extract additional metadata (voiD, etc.)
    const metadata: Record<string, unknown> = {};
    const allQuads = store.getQuads(graphNode, null, null, null);

    for (const quad of allQuads) {
      const predicate = quad.predicate.value;
      // Skip known SD properties
      if (!predicate.startsWith(SD)) {
        metadata[predicate] = quad.object.value;
      }
    }

    return {
      uri: uri !== graphNode.value ? uri : undefined,
      entailmentRegime,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
  }

  /**
   * Extract rdfs:label from resource
   */
  private extractLabel(store: Store, resource: Quad['object']): string | undefined {
    const labelQuads = store.getQuads(resource, namedNode(`${RDFS}label`), null, null);
    return labelQuads[0]?.object.value;
  }

  /**
   * Extract rdfs:comment from resource
   */
  private extractComment(store: Store, resource: Quad['object']): string | undefined {
    const commentQuads = store.getQuads(resource, namedNode(`${RDFS}comment`), null, null);
    return commentQuads[0]?.object.value;
  }

  /**
   * Determine RDF format from content type
   */
  private getRdfFormat(contentType: string): string {
    if (contentType.includes('turtle')) return 'Turtle';
    if (contentType.includes('n-triples')) return 'N-Triples';
    if (contentType.includes('n-quads')) return 'N-Quads';
    if (contentType.includes('trig')) return 'TriG';
    return 'Turtle'; // Default to Turtle
  }

  /**
   * Create unavailable service description
   */
  private createUnavailableDescription(endpointUrl: string): ServiceDescription {
    return {
      endpoint: endpointUrl,
      supportedLanguages: [],
      features: [],
      resultFormats: [],
      inputFormats: [],
      extensionFunctions: [],
      extensionAggregates: [],
      datasets: [],
      lastFetched: new Date(),
      available: false,
    };
  }
}

/**
 * Singleton instance of ServiceDescriptionService
 */
export const serviceDescriptionService = new ServiceDescriptionService();
