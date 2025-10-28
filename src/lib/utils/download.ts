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
  try {
    // Convert object to string if needed
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    // Create blob
    const blob = new Blob([content], { type: mimeType });

    // Check if we're in an iframe (like Storybook)
    const inIframe = window.self !== window.top;

    // Create temporary download link
    const url = URL.createObjectURL(blob);

    if (inIframe) {
      // In iframe (Storybook): open in new window so browser can handle download
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        // Set a title that hints at downloading
        setTimeout(() => {
          try {
            newWindow.document.title = `Download: ${filename}`;
          } catch (e) {
            // May fail due to CORS, ignore
          }
        }, 100);
      } else {
        console.warn('[Download] Popup blocked - please allow popups to download files');
      }

      // Cleanup blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } else {
      // Normal context: use download attribute
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Make link invisible and set attributes for better compatibility
      // Check if methods exist (may not in test environments)
      if (link.style) {
        link.style.display = 'none';
      }
      if (typeof link.setAttribute === 'function') {
        link.setAttribute('target', '_blank');
      }

      // Append to DOM and trigger click
      document.body.appendChild(link);

      // Trigger click
      link.click();

      // Cleanup after a small delay to ensure download triggers
      setTimeout(() => {
        // Check if link still exists in DOM before removing (important for test environments)
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);
    }
  } catch (error) {
    console.error('[Download] Download failed:', error);
    throw error;
  }
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
