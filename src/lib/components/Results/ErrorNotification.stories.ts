/**
 * ErrorNotification Component Stories
 * Demonstrates various error types and their display
 * Task review-10: CORS error messaging verification
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import ErrorNotification from './ErrorNotification.svelte';
import type { QueryError } from '../../types';

const meta = {
  title: 'Results/ErrorNotification',
  component: ErrorNotification,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<ErrorNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * CORS Error
 * Shows enhanced error message with actionable solutions for CORS issues
 */
export const CorsError: Story = {
  args: {
    error: {
      message: 'CORS Error: Cross-origin request blocked',
      type: 'cors',
      details: `The SPARQL endpoint does not allow cross-origin requests from this domain.

Possible solutions:
• Use a CORS proxy service (e.g., https://corsproxy.io or https://cors-anywhere.herokuapp.com)
• For development: Use browser extensions to disable CORS (not recommended for production)
• Contact the endpoint administrator to enable CORS headers (Access-Control-Allow-Origin)
• Set up your own proxy server to forward requests

Note: CORS (Cross-Origin Resource Sharing) is a browser security feature that restricts web pages from making requests to different domains. Many public SPARQL endpoints lack proper CORS configuration.`,
    } as QueryError,
  },
};

/**
 * Network Error
 * Shows error when endpoint is unreachable
 */
export const NetworkError: Story = {
  args: {
    error: {
      message: 'Network error: Unable to reach endpoint',
      type: 'network',
      details: 'Check that the endpoint URL is correct and the server is reachable.',
    } as QueryError,
  },
};

/**
 * HTTP 400 - Bad Request
 * Shows error for invalid SPARQL query syntax
 */
export const BadRequest: Story = {
  args: {
    error: {
      message: 'Bad Request: Invalid SPARQL query',
      type: 'sparql',
      status: 400,
      details: 'Syntax error at line 1: Expected SELECT, ASK, CONSTRUCT, or DESCRIBE',
    } as QueryError,
  },
};

/**
 * HTTP 401 - Unauthorized
 * Shows error when authentication is required
 */
export const Unauthorized: Story = {
  args: {
    error: {
      message: 'Unauthorized: Authentication required',
      type: 'http',
      status: 401,
      details: 'This endpoint requires authentication. Please provide valid credentials.',
    } as QueryError,
  },
};

/**
 * HTTP 403 - Forbidden
 * Shows error when access is denied
 */
export const Forbidden: Story = {
  args: {
    error: {
      message: 'Forbidden: Access denied to this endpoint',
      type: 'http',
      status: 403,
      details: 'You do not have permission to access this SPARQL endpoint.',
    } as QueryError,
  },
};

/**
 * HTTP 404 - Not Found
 * Shows error when endpoint doesn't exist
 */
export const NotFound: Story = {
  args: {
    error: {
      message: 'Not Found: Endpoint does not exist',
      type: 'http',
      status: 404,
      details: 'The SPARQL endpoint URL may be incorrect or the service may have moved.',
    } as QueryError,
  },
};

/**
 * HTTP 408 - Request Timeout
 * Shows error when query execution times out
 */
export const RequestTimeout: Story = {
  args: {
    error: {
      message: 'Request Timeout: Query took too long to execute',
      type: 'http',
      status: 408,
      details: 'The query exceeded the server timeout limit. Try simplifying your query or adding LIMIT clause.',
    } as QueryError,
  },
};

/**
 * HTTP 500 - Internal Server Error
 * Shows error when SPARQL endpoint has an internal error
 */
export const InternalServerError: Story = {
  args: {
    error: {
      message: 'Internal Server Error: The SPARQL endpoint encountered an error',
      type: 'http',
      status: 500,
      details: 'The server encountered an unexpected condition. This is typically a server-side issue.',
    } as QueryError,
  },
};

/**
 * HTTP 502 - Bad Gateway
 * Shows error when SPARQL endpoint is not responding correctly
 */
export const BadGateway: Story = {
  args: {
    error: {
      message: 'Bad Gateway: The SPARQL endpoint is not responding correctly',
      type: 'http',
      status: 502,
      details: 'The server received an invalid response from the upstream server.',
    } as QueryError,
  },
};

/**
 * HTTP 503 - Service Unavailable
 * Shows error when SPARQL endpoint is temporarily down
 */
export const ServiceUnavailable: Story = {
  args: {
    error: {
      message: 'Service Unavailable: The SPARQL endpoint is temporarily down',
      type: 'http',
      status: 503,
      details: 'The server is temporarily unable to handle the request. Please try again later.',
    } as QueryError,
  },
};

/**
 * HTTP 504 - Gateway Timeout
 * Shows error when SPARQL endpoint doesn't respond in time
 */
export const GatewayTimeout: Story = {
  args: {
    error: {
      message: 'Gateway Timeout: The SPARQL endpoint did not respond in time',
      type: 'http',
      status: 504,
      details: 'The server did not receive a timely response from the upstream server.',
    } as QueryError,
  },
};

/**
 * Client Timeout
 * Shows error when query is cancelled due to client-side timeout
 */
export const ClientTimeout: Story = {
  args: {
    error: {
      message: 'Query timeout or cancelled',
      type: 'timeout',
      details: 'The query took too long to execute or was cancelled by the user.',
    } as QueryError,
  },
};

/**
 * SPARQL Syntax Error
 * Shows error for malformed SPARQL query
 */
export const SparqlSyntaxError: Story = {
  args: {
    error: {
      message: 'SPARQL Syntax Error',
      type: 'sparql',
      details: `Parse error at line 3, column 15:
Unexpected token '}'
Expected: variable, IRI, or literal

Query fragment:
  SELECT ?s ?p ?o WHERE {
    ?s ?p ?o }
            ^`,
    } as QueryError,
  },
};

/**
 * Generic String Error
 * Shows error when only a string message is provided
 */
export const StringError: Story = {
  args: {
    error: 'Query execution failed: Endpoint not responding (timeout after 30s)',
  },
};

/**
 * Unknown Error
 * Shows error for unexpected/uncategorized errors
 */
export const UnknownError: Story = {
  args: {
    error: {
      message: 'An unexpected error occurred',
      type: 'unknown',
      details: 'Error: Unexpected token in JSON at position 42',
    } as QueryError,
  },
};

/**
 * Error with Very Long Details
 * Tests expandable details section with verbose error information
 */
export const LongErrorDetails: Story = {
  args: {
    error: {
      message: 'Internal Server Error: The SPARQL endpoint encountered an error',
      type: 'http',
      status: 500,
      details: `Full stack trace:

org.openrdf.query.MalformedQueryException: Encountered " "SELECT" "SELECT "" at line 1, column 1.
Was expecting one of:
    "BASE" ...
    "PREFIX" ...

    at org.openrdf.query.parser.sparql.SPARQLParser.parseQuery(SPARQLParser.java:123)
    at org.openrdf.repository.sparql.query.SPARQLQueryPreparer.prepare(SPARQLQueryPreparer.java:45)
    at org.openrdf.repository.sparql.SPARQLRepository.prepareQuery(SPARQLRepository.java:178)
    at com.example.sparql.QueryExecutor.execute(QueryExecutor.java:89)
    at com.example.sparql.servlet.SparqlServlet.doPost(SparqlServlet.java:145)
    at javax.servlet.http.HttpServlet.service(HttpServlet.java:646)
    at javax.servlet.http.HttpServlet.service(HttpServlet.java:727)

This error indicates that the query could not be parsed by the server.
Please check your SPARQL syntax and try again.`,
    } as QueryError,
  },
};

/**
 * No Error (Null)
 * Component should not render when error is null
 */
export const NoError: Story = {
  args: {
    error: null,
  },
};
