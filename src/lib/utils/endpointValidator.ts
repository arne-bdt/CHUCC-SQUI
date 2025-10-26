/**
 * Endpoint validation utilities
 * Validates SPARQL endpoint URLs for correctness and accessibility
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  /** Whether the URL is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Warning message (non-blocking) */
  warning?: string;
}

/**
 * Validates a URL format
 * @param url - The URL to validate
 * @returns Validation result
 */
export function validateUrlFormat(url: string): ValidationResult {
  // Empty URL is valid (will show as not configured)
  if (!url || url.trim() === '') {
    return { valid: true };
  }

  const trimmedUrl = url.trim();

  // Check if it's a valid URL
  try {
    const parsed = new URL(trimmedUrl);

    // Must be HTTP or HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Endpoint URL must use HTTP or HTTPS protocol',
      };
    }

    // Warn about HTTP (insecure)
    if (parsed.protocol === 'http:') {
      return {
        valid: true,
        warning: 'HTTP endpoints may not work due to mixed content restrictions',
      };
    }

    return { valid: true };
  } catch (_error) {
    return {
      valid: false,
      error: 'Invalid URL format. Please enter a complete URL (e.g., https://example.com/sparql)',
    };
  }
}

/**
 * Tests endpoint accessibility (optional check)
 * Makes a HEAD request to verify the endpoint is reachable
 * @param url - The endpoint URL to test
 * @returns Validation result with CORS/accessibility information
 */
export async function testEndpointAccessibility(url: string): Promise<ValidationResult> {
  const formatValidation = validateUrlFormat(url);
  if (!formatValidation.valid) {
    return formatValidation;
  }

  // Don't test empty URLs
  if (!url || url.trim() === '') {
    return { valid: true };
  }

  try {
    // Use HEAD request to minimize data transfer
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache',
    });

    if (response.ok) {
      // Preserve warning from format validation (e.g., HTTP protocol warning)
      return {
        valid: true,
        warning: formatValidation.warning,
      };
    } else {
      return {
        valid: true,
        warning: `Endpoint returned HTTP ${response.status}. It may still work for queries.`,
      };
    }
  } catch (error) {
    // Check if it's a CORS error
    if (error instanceof TypeError) {
      return {
        valid: true,
        warning: 'Unable to verify endpoint (CORS restriction). Queries may still work.',
      };
    }

    return {
      valid: true,
      warning: `Unable to reach endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validates SPARQL endpoint URL
 * Performs format validation only (synchronous)
 * @param url - The endpoint URL to validate
 * @returns Validation result
 */
export function validateEndpoint(url: string): ValidationResult {
  return validateUrlFormat(url);
}
