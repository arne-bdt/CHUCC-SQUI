# Streaming & Large Results: Implementation Plan

This directory contains a comprehensive plan for implementing performance optimizations and streaming support for large SPARQL result sets in SQUI.

## 📋 Overview

The original specification proposed implementing streaming based on several **incorrect assumptions**. After thorough research and analysis, this plan provides evidence-based solutions that actually work.

## ❌ What Was Wrong with Original Spec

### Myth 1: "Endpoints stream results progressively"
**Reality**: SPARQL 1.2 Protocol does NOT define streaming. Endpoints buffer and send complete responses.

### Myth 2: "Parse JSON chunks as they come"
**Reality**: Standard SPARQL JSON structure (`{"head": {...}, "results": {"bindings": [...]}}`) cannot be incrementally parsed.

### Myth 3: "OFFSET pagination is simpler"
**Reality**: OFFSET has serious problems (non-deterministic results, O(N) performance, bad UX).

See **[STREAMING-00-ANALYSIS.md](./STREAMING-00-ANALYSIS.md)** for detailed analysis.

## ✅ What Actually Works

### Evidence-Based Solutions

1. **CSV/TSV Streaming** - ACTUALLY works (line-oriented formats)
2. **Progressive UI Feedback** - Improves perceived performance
3. **Non-Blocking Parsing** - Web Workers keep UI responsive
4. **Memory Management** - Prevent crashes with warnings and limits

## 📊 Implementation Phases

### Phase 1: Measure & Understand (1 task)

**[STREAMING-01: Performance Profiling](./STREAMING-01-PERFORMANCE-PROFILING.md)**
- Measure actual bottlenecks (network, parsing, rendering, memory)
- Create profiling utilities and performance test suite
- Identify 95th percentile use cases
- **Priority**: High (prerequisite for optimizations)
- **Effort**: 4-6 hours

### Phase 2: Low-Hanging Fruit (2 tasks)

**[STREAMING-02: Progressive UI Feedback](./STREAMING-02-PROGRESSIVE-UI-FEEDBACK.md)**
- Show detailed progress through execution phases
- Display bytes downloaded, parse progress, time elapsed
- Warn about slow queries
- **Priority**: High (cheap, high perceived value)
- **Effort**: 2-3 hours

**[STREAMING-03: Memory Management](./STREAMING-03-MEMORY-MANAGEMENT.md)**
- Warn before executing queries that may be large
- Better truncation warnings with action buttons
- Suggest "Download CSV" for large results
- Memory usage monitoring
- **Priority**: High (safety/stability)
- **Effort**: 3-4 hours

### Phase 3: Real Performance Wins (2-3 tasks)

**[STREAMING-04: CSV/TSV Streaming](./STREAMING-04-CSV-TSV-STREAMING.md)**
- Implement line-by-line streaming parsers
- Progressive rendering as rows arrive
- Memory-efficient handling of large datasets
- **Priority**: Medium (real benefit, but format-specific)
- **Effort**: 6-8 hours

**[STREAMING-05: Non-Blocking Parsing](./STREAMING-05-NON-BLOCKING-PARSING.md)**
- Move JSON parsing to Web Worker
- Chunked parsing for very large results
- Keep UI responsive during parsing
- **Priority**: Medium (improves responsiveness)
- **Effort**: 4-6 hours

### Phase 4: Advanced (Future, Optional)

- NDJSON support (if endpoints adopt it)
- Streaming JSON parser library evaluation
- Result caching in IndexedDB
- Query optimization suggestions

## 📈 Expected Benefits

### CSV/TSV Streaming (Task 04)
- **Memory**: ~90% reduction for large datasets
- **Time to first row**: < 100ms vs waiting for full download
- **Perceived speed**: Immediate feedback

### Non-Blocking Parsing (Task 05)
- **UI responsiveness**: Main thread stays unblocked
- **User experience**: No "page unresponsive" warnings
- **Overhead**: ~20% slower total parse time (acceptable trade-off)

### Progressive UI Feedback (Task 02)
- **Perceived performance**: Users see what's happening
- **User confidence**: Know query isn't stuck
- **Cost**: Nearly zero (just UI updates)

## 🎯 Recommended Implementation Order

1. **STREAMING-01** (Profiling) - Understand actual bottlenecks
2. **STREAMING-02** (UI Feedback) - Quick win, high impact
3. **STREAMING-03** (Memory Management) - Prevent crashes
4. **STREAMING-01** (Validate) - Measure impact of changes
5. **STREAMING-04** (CSV/TSV) - Real streaming for supported formats
6. **STREAMING-05** (Workers) - Keep UI responsive

## 🔬 Research Sources

### SPARQL Protocol
- **W3C SPARQL 1.2 Protocol**: https://www.w3.org/TR/sparql12-protocol/
  - Findings: No streaming mechanisms defined
  - Standard HTTP request-response only

### Format Performance
- **SPARQL CSV/TSV Formats**: https://www.w3.org/TR/sparql12-results-csv-tsv/
  - TSV preserves RDF types, faster than CSV
  - CSV is lossy but universally supported
  - Both naturally streamable (line-oriented)

### Virtuoso Capabilities
- **Anytime Query**: Partial results after timeout (NOT streaming)
- No evidence of progressive result delivery

### JavaScript Streaming
- **Fetch ReadableStream API**: Supports streaming
- **Standard JSON**: Cannot be incrementally parsed
- **NDJSON**: Can be streamed (but SPARQL doesn't use it)

## 📝 Key Insights

### What We Learned

1. **Protocol limitations**: SPARQL protocol doesn't support streaming
2. **Format matters**: CSV/TSV can stream, JSON cannot (without extensions)
3. **Perceived > Actual**: UI feedback often more valuable than actual speed
4. **Memory is critical**: Large results can crash browsers
5. **Format selection**: Automatic format selection based on query size

### Design Decisions

1. **No fake streaming**: Don't pretend to stream JSON that doesn't stream
2. **Format-appropriate**: Use streaming where it actually works (CSV/TSV)
3. **Progressive UI**: Show progress even when not streaming
4. **Safety first**: Warn and limit before crashes happen
5. **Adaptive strategies**: Choose approach based on result size

## 🚫 What NOT to Do

### Avoid These Approaches

1. ❌ **Don't fake streaming for JSON** - it doesn't work
2. ❌ **Don't use OFFSET pagination automatically** - correctness issues
3. ❌ **Don't assume endpoints stream** - they don't
4. ❌ **Don't add heavy libraries** - bundle size matters
5. ❌ **Don't optimize without measuring** - profile first

### Anti-Patterns

```typescript
// ❌ DON'T: Try to stream standard SPARQL JSON
await response.body.getReader().read(); // Doesn't help - need full response to parse

// ❌ DON'T: Automatic OFFSET pagination
for (let offset = 0; offset < total; offset += 1000) {
  // Non-deterministic results, slow, bad UX
}

// ❌ DON'T: Heavy streaming JSON parser
import heavyParser from 'streaming-json-parser'; // +100KB bundle size
```

```typescript
// ✅ DO: Format-appropriate streaming
if (format === 'tsv') {
  const parser = new TSVStreamParser();
  // Line-by-line streaming works!
}

// ✅ DO: Explicit user-triggered pagination
if (userClicksLoadMore) {
  // User understands data may have changed
}

// ✅ DO: Progressive UI with existing APIs
response.body.getReader().read().then(/* show progress */);
```

## 📚 Documentation

Each task file contains:
- ✅ Detailed implementation plan
- ✅ Code examples and templates
- ✅ Testing requirements
- ✅ Performance characteristics
- ✅ Future enhancements

## 🤔 Questions to Resolve

Before starting implementation, clarify:

1. **What's the actual pain point?**
   - User complaints about slow queries?
   - Browser crashes?
   - Uncertainty about progress?

2. **What are typical dataset sizes?**
   - 90% < 1k rows? → Simple approach fine
   - Regular 50k+ rows? → Need robust solutions

3. **What endpoints are targeted?**
   - Public endpoints? → Must work with standard protocol
   - Controlled endpoints? → Could extend with custom features

4. **Bundle size constraints?**
   - Adding streaming parser: +50-100 KB
   - Worth it for edge cases?

## 💡 Success Metrics

How to measure success after implementation:

1. **Performance**:
   - Time to first row (should decrease with streaming)
   - Main thread block time (should be ~0ms with workers)
   - Memory usage (should decrease with streaming)

2. **User Experience**:
   - "Page unresponsive" warnings (should be eliminated)
   - User complaints about slow queries (should decrease)
   - Query completion rate (users not canceling out of frustration)

3. **Reliability**:
   - Browser crash rate (should be zero with memory management)
   - Query success rate (should improve with better limits)

## 🔗 Dependencies

### External Libraries (None Required!)

All solutions use standard browser APIs:
- ✅ Fetch API (built-in)
- ✅ ReadableStream (built-in)
- ✅ Web Workers (built-in)
- ✅ Performance API (built-in)

**No new dependencies needed** - keeps bundle size small.

## 📞 Support

Questions or issues with this plan?

1. Review **[STREAMING-00-ANALYSIS.md](./STREAMING-00-ANALYSIS.md)** for detailed analysis
2. Check individual task files for implementation details
3. Run **STREAMING-01** first to validate assumptions with real data

---

**Created**: 2025-01-06
**Based on**: Research of SPARQL 1.2 Protocol, endpoint capabilities, browser APIs
**Status**: Planning phase - ready for implementation
