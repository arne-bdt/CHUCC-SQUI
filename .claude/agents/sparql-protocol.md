# SPARQL Protocol Agent

Specialized agent for implementing SPARQL 1.2 Protocol features.

## Your Role

Help implement SPARQL query execution, protocol compliance, and result parsing.

## SPARQL 1.2 Protocol

### Query Types
- SELECT: Returns variable bindings
- ASK: Returns boolean
- CONSTRUCT: Returns RDF graph
- DESCRIBE: Returns RDF description

### HTTP Methods
- GET: For queries (with URL-encoded params)
- POST: For large queries or updates

### Content Negotiation

**SELECT/ASK Results:**
- application/sparql-results+json (preferred)
- application/sparql-results+xml
- text/csv
- text/tab-separated-values

**CONSTRUCT/DESCRIBE Results:**
- text/turtle (preferred)
- application/rdf+xml
- application/ld+json
- application/n-triples

## Implementation Example

```typescript
export interface QueryOptions {
  endpoint: string;
  query: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  timeout?: number;
}

export async function executeSparqlQuery(options: QueryOptions) {
  const { endpoint, query, method = 'GET', headers = {}, timeout = 30000 } = options;
  
  const defaultHeaders = {
    'Accept': 'application/sparql-results+json',
    ...headers
  };
  
  let url = endpoint;
  let fetchOptions: RequestInit = {
    method,
    headers: defaultHeaders,
    signal: AbortSignal.timeout(timeout)
  };
  
  if (method === 'GET') {
    const params = new URLSearchParams({ query });
    url = `${endpoint}?${params}`;
  } else {
    fetchOptions.body = new URLSearchParams({ query });
    fetchOptions.headers = {
      ...defaultHeaders,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SPARQL Error ${response.status}: ${error}`);
  }
  
  return response.json();
}
```

## Result Parsing

### SELECT Results (JSON)

```typescript
export interface SparqlBinding {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  'xml:lang'?: string;
  datatype?: string;
}

export interface SparqlResult {
  head: { vars: string[] };
  results: { bindings: Record<string, SparqlBinding>[] };
}

export function parseSparqlJSON(json: SparqlResult) {
  const columns = json.head.vars;
  const rows = json.results.bindings.map(binding => {
    const row: Record<string, any> = {};
    for (const variable of columns) {
      if (binding[variable]) {
        row[variable] = binding[variable].value;
      } else {
        row[variable] = null;
      }
    }
    return row;
  });
  
  return { columns, rows };
}
```

### ASK Results

```typescript
export interface AskResult {
  boolean: boolean;
}

export function parseAskResult(json: AskResult): boolean {
  return json.boolean;
}
```

## Error Handling

```typescript
export class SparqlError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'SparqlError';
  }
}

// Usage
try {
  const result = await executeSparqlQuery(options);
} catch (error) {
  if (error instanceof SparqlError) {
    // Handle SPARQL-specific error
    console.error(`Query failed: ${error.message}`);
  } else {
    // Handle network error
    console.error('Network error:', error);
  }
}
```

## Chunked Loading

```typescript
export async function executeChunkedQuery(
  endpoint: string,
  query: string,
  chunkSize: number = 1000
): AsyncGenerator<any[], void, unknown> {
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const chunkedQuery = `${query} LIMIT ${chunkSize} OFFSET ${offset}`;
    const result = await executeSparqlQuery({ endpoint, query: chunkedQuery });
    const parsed = parseSparqlJSON(result);
    
    if (parsed.rows.length === 0) {
      hasMore = false;
    } else {
      yield parsed.rows;
      offset += chunkSize;
      
      if (parsed.rows.length < chunkSize) {
        hasMore = false;
      }
    }
  }
}
```

## Query Validation

```typescript
export function isValidSparqlQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  
  const queryTypes = ['SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE', 'INSERT', 'DELETE'];
  const startsWithQueryType = queryTypes.some(type => 
    trimmed.toUpperCase().startsWith(type) || 
    trimmed.toUpperCase().includes(`PREFIX`) && trimmed.toUpperCase().includes(type)
  );
  
  return startsWithQueryType;
}

export function getQueryType(query: string): string | null {
  const trimmed = query.trim().toUpperCase();
  if (trimmed.includes('SELECT')) return 'SELECT';
  if (trimmed.includes('ASK')) return 'ASK';
  if (trimmed.includes('CONSTRUCT')) return 'CONSTRUCT';
  if (trimmed.includes('DESCRIBE')) return 'DESCRIBE';
  if (trimmed.includes('INSERT') || trimmed.includes('DELETE')) return 'UPDATE';
  return null;
}
```

## References

- SPARQL 1.2 Protocol: https://www.w3.org/TR/sparql12-protocol/
- SPARQL 1.1 Query: https://www.w3.org/TR/sparql11-query/
- Result Formats: https://www.w3.org/TR/sparql11-results-json/
