# Streaming & Large Results: Critical Analysis

**Status**: Analysis & Planning
**Priority**: Medium
**Estimated Effort**: 5-8 tasks (varies by approach)

## Original Specification Claims

> "SQUI currently waits for full response then parses. Some endpoints (Virtuoso) stream results progressively. In the future, to improve perceived performance, we could parse JSON chunks as they come (using fetch Streams API and a streaming JSON parser)."

## Critical Analysis: What's Wrong with This Specification?

### ❌ Assumption 1: "Endpoints stream results progressively"

**Reality**: **FALSE** - SPARQL endpoints do NOT stream results.

**Evidence**:
- SPARQL 1.2 Protocol specification contains ZERO mentions of streaming, chunked transfer, or progressive delivery
- Protocol is designed around discrete HTTP request-response pairs
- Virtuoso has "Anytime Query" (partial results after timeout), NOT streaming
- Standard SPARQL endpoints buffer complete results and send as single HTTP response

**Source**: https://www.w3.org/TR/sparql12-protocol/ (Web fetch: no streaming mechanisms defined)

### ❌ Assumption 2: "Parse JSON chunks as they come"

**Reality**: **IMPRACTICAL** for standard SPARQL JSON format.

**Why**:
- SPARQL JSON structure: `{"head": {...}, "results": {"bindings": [...]}}`
- Cannot show results until entire `bindings` array is parsed
- JSON.parse() requires complete, valid JSON document
- Chunk boundaries are unpredictable (mid-object splits)
- No built-in JavaScript streaming JSON parser

**Workarounds**:
- ✅ NDJSON format (newline-delimited JSON) - but SPARQL endpoints don't return this
- ✅ Custom streaming parser library - adds complexity and bundle size
- ❌ Standard SPARQL JSON - fundamentally not streaming-friendly

### ⚠️ Assumption 3: "OFFSET approach is simpler"

**Reality**: **MISLEADING** - has serious correctness and performance problems.

**Problems**:
1. **Non-deterministic results**: If data changes between queries → duplicates or missing rows
2. **Slow performance**: OFFSET requires database to skip N rows every time (O(N) cost)
3. **Poor UX**: User must scroll to trigger new queries
4. **Complex state management**: Track loaded ranges, handle errors in partial loads
5. **No transactional consistency**: Each query sees different dataset snapshot

**Better alternatives**:
- Client-side pagination (load once, paginate in memory)
- Server-side cursor-based pagination (but SPARQL doesn't have cursors)
- Limit + warning about truncation (current approach - simple and honest)

## What Problem Are We Actually Solving?

The spec says "improve perceived performance" but doesn't identify the **actual bottleneck**.

### Potential Bottlenecks (need measurement):

1. ⏱️ **Network transfer time**
   - Usually fast (compressed JSON, HTTP/2)
   - Endpoint query execution is usually the bottleneck, not transfer

2. ⚡ **Parsing time**
   - Native JSON.parse() is highly optimized
   - Only becomes issue for 100k+ row results

3. 🖥️ **Rendering time**
   - wx-svelte-grid uses virtual scrolling (only renders visible rows)
   - Should handle large datasets efficiently

4. 💾 **Memory issues**
   - Large result sets (100k+ rows) can exhaust browser memory
   - **REAL PROBLEM** - need limits and warnings

5. 🤷 **User feedback**
   - Users don't know if query is running or stalled
   - **REAL PROBLEM** - need better progress indicators

### Current Implementation Status

✅ **Already Implemented**:
- Query timeout and cancellation (sparqlService.ts:74-82)
- AbortController for fetch cancellation
- Loading states in UI
- Virtual scrolling in data grid (wx-svelte-grid)
- maxRows limit enforcement (resultsParser.ts:150)

❌ **Missing**:
- Progress indicators during network transfer
- Chunked parsing to avoid main thread blocking
- Memory usage warnings for large datasets
- Format-specific optimizations (CSV/TSV streaming)

## What Actually Works: Evidence-Based Solutions

### ✅ Solution 1: CSV/TSV Streaming (ACTUALLY WORKS)

**Why this works**:
- CSV/TSV are line-oriented formats (natural streaming boundary)
- Can parse line-by-line without loading full response
- TSV faster than CSV (no escape syntax parsing, optimized newline search)
- TSV preserves RDF type info, CSV is lossy

**Performance benefits**:
- 📉 Lower memory usage (process line-by-line)
- ⚡ Faster parsing (simpler format than JSON/XML)
- 🎯 Progressive rendering (show rows as parsed)

**Trade-offs**:
- Less rich metadata than JSON format
- Not all endpoints support CSV/TSV (but most do)
- Need separate parser implementation

**Effort**: Medium (2-3 tasks)

### ✅ Solution 2: Progressive UI Feedback (LOW-HANGING FRUIT)

**What it provides**:
- Show "Receiving response..." during network transfer
- Show "Parsing results..." during JSON.parse()
- Progress bar if Content-Length header available
- Bytes received counter

**Why this helps**:
- **Improves perceived performance** (the actual goal!)
- No format changes needed
- Works with all endpoints
- Simple to implement

**Effort**: Low (1 task)

### ✅ Solution 3: Non-Blocking Parsing (REAL PERFORMANCE WIN)

**Approach**:
- Move JSON.parse() to Web Worker
- Parse in chunks (even if JSON) to avoid blocking main thread
- Use `requestIdleCallback` for parsing work

**Why this helps**:
- Keeps UI responsive during parsing
- Prevents "page unresponsive" warnings
- Good for 10k+ row results

**Effort**: Medium (2 tasks)

### ✅ Solution 4: Memory Management (SAFETY)

**Features**:
- Enforce maxRows limit (already implemented!)
- Warn before executing queries that may return huge results
- Offer "Download to CSV" instead of "View in browser" for large results
- Memory usage estimation before rendering

**Why this matters**:
- Prevents browser crashes
- Better user guidance
- Clear expectations

**Effort**: Low-Medium (1-2 tasks)

### ❓ Solution 5: Smart Pagination (COMPLEX, QUESTIONABLE VALUE)

**Approaches**:
1. **Client-side pagination** (already have this via grid's virtual scrolling)
2. **Server-side LIMIT/OFFSET** (has problems - see analysis above)
3. **Cursor-based** (SPARQL doesn't support cursors)

**Recommendation**:
- ✅ Keep current approach (maxRows limit + truncation warning)
- ✅ Maybe add "Load next 10k rows" button (explicit user action)
- ❌ Don't do automatic OFFSET pagination (correctness issues)

**Effort**: Medium-High (3-4 tasks) **BUT questionable value**

## Performance Profiling: What We Need to Measure

**Before implementing anything, we should measure**:

1. ✅ Network transfer time vs query execution time
2. ✅ JSON parsing time for various dataset sizes (1k, 10k, 100k rows)
3. ✅ Grid rendering time (first paint, full render)
4. ✅ Memory usage for various dataset sizes
5. ✅ User perception: when do users feel "slow"?

**Tool**: Create performance profiling utilities

**Effort**: Low (1 task)

## Recommended Implementation Plan

### Phase 1: Measure & Understand (1 task)
1. ✅ Performance profiling utilities
   - Measure actual bottlenecks in real queries
   - Test against various endpoints (DBpedia, Wikidata, etc.)
   - Identify 95th percentile use cases

### Phase 2: Low-Hanging Fruit (2 tasks)
2. ✅ Progressive UI feedback
   - "Receiving response..." / "Parsing..." states
   - Bytes received counter
   - Progress estimation when possible

3. ✅ Memory management improvements
   - Warn before executing queries that may be large
   - Better error messages when maxRows hit
   - "Download CSV instead" option for large results

### Phase 3: Real Performance Wins (3-4 tasks)
4. ✅ CSV/TSV streaming support
   - Line-by-line parser for CSV/TSV formats
   - Progressive rendering as lines parsed
   - Format selection UI (prefer CSV/TSV for large results)

5. ✅ Non-blocking parsing
   - Web Worker for JSON parsing
   - Chunked parsing to avoid main thread blocking
   - Progress updates during parse

6. ⚠️ (Optional) Smart result limiting
   - "Load next 10k rows" explicit action
   - Client-side filtering/search
   - Virtual scrolling enhancements

### Phase 4: Advanced (Future, if needed)
7. ❓ NDJSON support (if endpoints adopt it)
8. ❓ Streaming JSON parser library (evaluate bundle size cost)
9. ❓ Result caching/persistence (IndexedDB)

## Key Recommendations

### ✅ DO IMPLEMENT:
1. **Performance profiling** - understand actual bottlenecks
2. **Progressive UI feedback** - cheap, high perceived value
3. **CSV/TSV streaming** - actually works, measurable benefit
4. **Non-blocking parsing** - keeps UI responsive
5. **Better memory warnings** - prevents crashes

### ⚠️ CONSIDER CAREFULLY:
1. **OFFSET pagination** - correctness issues, complex state management
2. **Streaming JSON parser library** - bundle size cost, complexity
3. **Advanced caching** - adds complexity, questionable value for typical use

### ❌ DON'T IMPLEMENT:
1. **"Streaming" from endpoints that don't stream** - doesn't exist
2. **Automatic background prefetching** - wastes server resources
3. **Complex cursor simulation** - SPARQL doesn't support it natively

## Questions for User/Stakeholders

Before implementing, clarify:

1. **What's the actual pain point?**
   - Users complaining about slow queries?
   - Browser crashes on large results?
   - Uncertainty about query progress?

2. **What's typical dataset size?**
   - 90% of queries return < 1000 rows? → Simple approach fine
   - Regular queries return 50k+ rows? → Need better solutions

3. **What endpoints are targeted?**
   - All public endpoints? → Must work with standard SPARQL protocol
   - Controlled endpoints? → Could extend protocol with streaming support

4. **What formats do target endpoints support?**
   - JSON only? → Limited streaming options
   - CSV/TSV? → Can do real streaming

5. **Bundle size constraints?**
   - Adding streaming JSON parser: +50-100 KB
   - Worth it for edge cases?

## Conclusion

The original specification makes several incorrect assumptions about SPARQL endpoint behavior and streaming capabilities.

**Real solution**: Focus on **progressive UI feedback**, **format-specific streaming** (CSV/TSV), and **non-blocking parsing** rather than trying to stream standard SPARQL JSON (which fundamentally doesn't support streaming).

**Next step**: Performance profiling to identify actual bottlenecks before implementing solutions.
