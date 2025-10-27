/**
 * Download utility functions - Task 38
 * Handles downloading query results in various formats
 */

import type { ResultFormat } from '../types';

/**
 * Get MIME type for a given result format
 */
export function getMimeType(format: ResultFormat): string {
  const mimeTypes: Record<ResultFormat, string> = {
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    turtle: 'text/turtle',
    jsonld: 'application/ld+json',
    ntriples: 'application/n-triples',
    rdfxml: 'application/rdf+xml',
  };
  return mimeTypes[format] || 'text/plain';
}

/**
 * Get file extension for a given result format
 */
export function getFileExtension(format: ResultFormat): string {
  const extensions: Record<ResultFormat, string> = {
    json: 'json',
    xml: 'xml',
    csv: 'csv',
    tsv: 'tsv',
    turtle: 'ttl',
    jsonld: 'jsonld',
    ntriples: 'nt',
    rdfxml: 'rdf',
  };
  return extensions[format] || 'txt';
}

/**
 * Generate a filename for downloaded results
 * @param format Result format
 * @param prefix Optional filename prefix (default: 'results')
 * @returns Filename with timestamp and extension
 */
export function generateFilename(format: ResultFormat, prefix: string = 'results'): string {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]; // 2024-01-15T10-30-45
  const extension = getFileExtension(format);
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Download data as a file
 * Creates a Blob and triggers browser download
 * @param data Data to download (string or object)
 * @param filename Filename for the download
 * @param mimeType MIME type for the file
 */
export function downloadFile(data: string | object, filename: string, mimeType: string): void {
  // Convert object to string if needed
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  // Create blob
  const blob = new Blob([content], { type: mimeType });

  // Create temporary download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download query results
 * @param data Raw results data
 * @param format Result format
 * @param filename Optional custom filename (will generate if not provided)
 */
export function downloadResults(
  data: string,
  format: ResultFormat,
  filename?: string
): void {
  const finalFilename = filename || generateFilename(format);
  const mimeType = getMimeType(format);
  downloadFile(data, finalFilename, mimeType);
}
