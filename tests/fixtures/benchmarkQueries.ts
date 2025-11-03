/**
 * Benchmark SPARQL queries for performance testing
 * These queries test various characteristics: size, complexity, formats
 */

export interface BenchmarkQuery {
  name: string;
  description: string;
  endpoint: string;
  query: string;
  expectedRowRange?: { min: number; max: number };
  format?: 'json' | 'csv' | 'tsv';
}

/**
 * DBpedia public endpoint
 */
export const DBPEDIA_ENDPOINT = 'https://dbpedia.org/sparql';

/**
 * Wikidata public endpoint
 */
export const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

/**
 * Small result query (< 100 rows)
 * Tests basic query execution and parsing overhead
 */
export const SMALL_RESULT_QUERY: BenchmarkQuery = {
  name: 'Small Result Set',
  description: 'Returns < 100 rows to test basic overhead',
  endpoint: DBPEDIA_ENDPOINT,
  query: `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT ?country ?capital
    WHERE {
      ?country a dbo:Country ;
               dbo:capital ?capital .
    }
    LIMIT 50
  `,
  expectedRowRange: { min: 1, max: 50 },
  format: 'json',
};

/**
 * Medium result query (1k-10k rows)
 * Tests typical application query performance
 */
export const MEDIUM_RESULT_QUERY: BenchmarkQuery = {
  name: 'Medium Result Set',
  description: 'Returns 1k-10k rows to test typical use case',
  endpoint: DBPEDIA_ENDPOINT,
  query: `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?person ?name ?birth
    WHERE {
      ?person a dbo:Person ;
              foaf:name ?name ;
              dbo:birthDate ?birth .
    }
    LIMIT 5000
  `,
  expectedRowRange: { min: 1000, max: 5000 },
  format: 'json',
};

/**
 * Large result query (50k+ rows)
 * Tests performance with substantial data
 * Note: May timeout on public endpoints or be rate-limited
 */
export const LARGE_RESULT_QUERY: BenchmarkQuery = {
  name: 'Large Result Set',
  description: 'Returns 10k+ rows to test scaling performance',
  endpoint: DBPEDIA_ENDPOINT,
  query: `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?s ?label
    WHERE {
      ?s rdfs:label ?label .
      FILTER(LANG(?label) = "en")
    }
    LIMIT 10000
  `,
  expectedRowRange: { min: 5000, max: 10000 },
  format: 'json',
};

/**
 * Wide result query (many columns)
 * Tests performance with many variables
 */
export const WIDE_RESULT_QUERY: BenchmarkQuery = {
  name: 'Wide Result Set',
  description: 'Returns many columns to test column handling',
  endpoint: DBPEDIA_ENDPOINT,
  query: `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?person ?name ?birth ?death ?abstract ?thumbnail ?website ?nationality
    WHERE {
      ?person a dbo:Person ;
              foaf:name ?name .
      OPTIONAL { ?person dbo:birthDate ?birth }
      OPTIONAL { ?person dbo:deathDate ?death }
      OPTIONAL { ?person dbo:abstract ?abstract . FILTER(LANG(?abstract) = "en") }
      OPTIONAL { ?person dbo:thumbnail ?thumbnail }
      OPTIONAL { ?person foaf:homepage ?website }
      OPTIONAL { ?person dbo:nationality ?nationality }
    }
    LIMIT 100
  `,
  expectedRowRange: { min: 50, max: 100 },
  format: 'json',
};

/**
 * CSV format query
 * Tests CSV parsing performance
 */
export const CSV_FORMAT_QUERY: BenchmarkQuery = {
  name: 'CSV Format',
  description: 'Tests CSV parsing performance',
  endpoint: DBPEDIA_ENDPOINT,
  query: `
    PREFIX dbo: <http://dbpedia.org/ontology/>

    SELECT ?city ?country ?population
    WHERE {
      ?city a dbo:City ;
            dbo:country ?country ;
            dbo:populationTotal ?population .
    }
    LIMIT 1000
  `,
  expectedRowRange: { min: 100, max: 1000 },
  format: 'csv',
};

/**
 * TSV format query
 * Tests TSV parsing performance
 */
export const TSV_FORMAT_QUERY: BenchmarkQuery = {
  name: 'TSV Format',
  description: 'Tests TSV parsing performance',
  endpoint: DBPEDIA_ENDPOINT,
  query: `
    PREFIX dbo: <http://dbpedia.org/ontology/>

    SELECT ?book ?author ?title
    WHERE {
      ?book a dbo:Book ;
            dbo:author ?author ;
            rdfs:label ?title .
      FILTER(LANG(?title) = "en")
    }
    LIMIT 1000
  `,
  expectedRowRange: { min: 100, max: 1000 },
  format: 'tsv',
};

/**
 * Wikidata query (different endpoint)
 * Tests cross-endpoint performance comparison
 */
export const WIKIDATA_QUERY: BenchmarkQuery = {
  name: 'Wikidata Query',
  description: 'Tests Wikidata endpoint performance',
  endpoint: WIKIDATA_ENDPOINT,
  query: `
    SELECT ?country ?countryLabel ?capital ?capitalLabel
    WHERE {
      ?country wdt:P31 wd:Q6256 ;
               wdt:P36 ?capital .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 100
  `,
  expectedRowRange: { min: 50, max: 100 },
  format: 'json',
};

/**
 * All benchmark queries
 */
export const ALL_BENCHMARK_QUERIES: BenchmarkQuery[] = [
  SMALL_RESULT_QUERY,
  MEDIUM_RESULT_QUERY,
  WIDE_RESULT_QUERY,
  CSV_FORMAT_QUERY,
  TSV_FORMAT_QUERY,
  WIKIDATA_QUERY,
  // Note: LARGE_RESULT_QUERY excluded by default to avoid timeouts
  // Add it explicitly for stress testing
];

/**
 * Quick benchmark queries (for fast testing)
 */
export const QUICK_BENCHMARK_QUERIES: BenchmarkQuery[] = [
  SMALL_RESULT_QUERY,
  WIDE_RESULT_QUERY,
  CSV_FORMAT_QUERY,
];

/**
 * Stress test queries (may timeout or be rate-limited)
 */
export const STRESS_TEST_QUERIES: BenchmarkQuery[] = [LARGE_RESULT_QUERY];
