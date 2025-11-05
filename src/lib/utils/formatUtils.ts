/**
 * Result Format Utilities
 * Utilities for SPARQL result format negotiation and selection
 */

import type { QueryType, ServiceDescription } from '../types';
import { getDefaultFormats, producesBindings } from './queryTypeDetection';

/**
 * Format label mappings (MIME type to human-readable label)
 */
const FORMAT_LABELS: Record<string, string> = {
  'application/sparql-results+json': 'JSON',
  'application/sparql-results+xml': 'XML',
  'text/csv': 'CSV',
  'text/tab-separated-values': 'TSV',
  'text/turtle': 'Turtle',
  'application/rdf+xml': 'RDF/XML',
  'application/n-triples': 'N-Triples',
  'application/ld+json': 'JSON-LD',
};

/**
 * Format description mappings (MIME type to detailed description)
 */
const FORMAT_DESCRIPTIONS: Record<string, string> = {
  'application/sparql-results+json': 'SPARQL JSON Results - Best for web applications',
  'application/sparql-results+xml': 'SPARQL XML Results - Standard format',
  'text/csv': 'Comma-Separated Values - Easy to import in Excel',
  'text/tab-separated-values': 'Tab-Separated Values - Alternative to CSV',
  'text/turtle': 'Turtle - Human-readable RDF',
  'application/rdf+xml': 'RDF/XML - Standard RDF format',
  'application/n-triples': 'N-Triples - Simple line-based RDF',
  'application/ld+json': 'JSON-LD - JSON-based RDF',
};

/**
 * Get human-readable label for MIME type format
 * @param mimeType MIME type string (e.g., "application/sparql-results+json")
 * @returns Human-readable format label (e.g., "JSON")
 */
export function getFormatLabel(mimeType: string): string {
  return FORMAT_LABELS[mimeType] || mimeType;
}

/**
 * Get detailed description for MIME type format
 * @param mimeType MIME type string
 * @returns Detailed format description
 */
export function getFormatDescription(mimeType: string): string {
  return FORMAT_DESCRIPTIONS[mimeType] || '';
}

/**
 * Get available formats for a query type from service description
 * Falls back to default formats if service description unavailable
 * @param serviceDesc Service description (optional)
 * @param queryType Type of SPARQL query
 * @returns Array of available MIME type formats
 */
export function getAvailableFormats(
  serviceDesc: ServiceDescription | undefined | null,
  queryType: QueryType
): string[] {
  // If no service description, return defaults
  if (!serviceDesc || !serviceDesc.available) {
    return getDefaultFormats(queryType);
  }

  const formats = serviceDesc.resultFormats;

  // Filter formats based on query type
  if (producesBindings(queryType)) {
    // SELECT/ASK - variable binding formats
    return formats.filter(
      (f) =>
        f.includes('sparql-results') || f.includes('csv') || f.includes('tab-separated-values')
    );
  } else {
    // CONSTRUCT/DESCRIBE - RDF formats
    return formats.filter(
      (f) =>
        f.includes('turtle') ||
        f.includes('rdf') ||
        f.includes('n-triples') ||
        f.includes('ld+json')
    );
  }
}

/**
 * Get the best format for a query type from available formats
 * Uses a preference order to select the most suitable format
 * @param formats Array of available MIME type formats
 * @param queryType Type of SPARQL query
 * @returns Best MIME type format from available options
 */
export function getBestFormat(formats: string[], queryType: QueryType): string {
  // Preference order for SELECT/ASK queries
  if (producesBindings(queryType)) {
    const preference = [
      'application/sparql-results+json',
      'application/sparql-results+xml',
      'text/csv',
      'text/tab-separated-values',
    ];

    for (const format of preference) {
      if (formats.includes(format)) {
        return format;
      }
    }
  }

  // Preference order for CONSTRUCT/DESCRIBE queries
  const preference = [
    'text/turtle',
    'application/rdf+xml',
    'application/ld+json',
    'application/n-triples',
  ];

  for (const format of preference) {
    if (formats.includes(format)) {
      return format;
    }
  }

  // Fallback to first available format or default JSON
  return formats[0] || 'application/sparql-results+json';
}

/**
 * Validate that requested format is supported by endpoint
 * Suggests alternative format if unsupported
 * @param requestedFormat Requested MIME type format
 * @param serviceDesc Service description (optional)
 * @param queryType Type of SPARQL query
 * @returns Validation result with suggested alternative if needed
 */
export function validateFormat(
  requestedFormat: string,
  serviceDesc: ServiceDescription | undefined | null,
  queryType: QueryType
): { valid: boolean; message?: string; suggestedFormat?: string } {
  // If no service description, assume format is valid
  if (!serviceDesc || !serviceDesc.available) {
    return { valid: true };
  }

  // Check if format is in supported list
  const supported = serviceDesc.resultFormats.includes(requestedFormat);

  if (supported) {
    return { valid: true };
  }

  // Find best alternative format
  const availableFormats = getAvailableFormats(serviceDesc, queryType);
  const suggestedFormat = getBestFormat(availableFormats, queryType);

  return {
    valid: false,
    message: `Format ${getFormatLabel(requestedFormat)} not supported by this endpoint`,
    suggestedFormat,
  };
}

/**
 * Convert ResultFormat short name to MIME type
 * @param format Short format name (e.g., "json", "turtle")
 * @returns MIME type string
 */
export function formatToMimeType(format: string): string {
  const mimeTypeMap: Record<string, string> = {
    json: 'application/sparql-results+json',
    xml: 'application/sparql-results+xml',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    turtle: 'text/turtle',
    jsonld: 'application/ld+json',
    ntriples: 'application/n-triples',
    rdfxml: 'application/rdf+xml',
  };

  return mimeTypeMap[format] || format;
}

/**
 * Convert MIME type to ResultFormat short name
 * @param mimeType MIME type string
 * @returns Short format name
 */
export function mimeTypeToFormat(mimeType: string): string {
  const formatMap: Record<string, string> = {
    'application/sparql-results+json': 'json',
    'application/sparql-results+xml': 'xml',
    'text/csv': 'csv',
    'text/tab-separated-values': 'tsv',
    'text/turtle': 'turtle',
    'application/ld+json': 'jsonld',
    'application/n-triples': 'ntriples',
    'application/rdf+xml': 'rdfxml',
  };

  return formatMap[mimeType] || 'json';
}
