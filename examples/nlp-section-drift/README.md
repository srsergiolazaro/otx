# 🔄 NLP: Section Drift Detector

> Identify semantic changes between document versions using Optimal Transport.

## The Problem

Standard 'diff' tools show line-by-line changes. However, if you move a paragraph or rewrite a sentence with synonyms, a diff shows everything as changed. **OTX Drift Detector** measures the semantic shift: it understands if the *content* is still the same, even if the words changed slightly.

```
       Version 1.0                  Version 1.1
    ┌───────────────┐            ┌───────────────┐
    │ # Intro       │            │ # Intro       │
    │ Stable text.. │   OTX      │ Small edits.. │  ──► ✅ STABLE
    │               │  Drift     │               │
    │ # Methods     │  Analysis  │ # Methods     │
    │ Old logic...  │ ─────────► │ New logic!!   │  ──► 🚨 REWRITTEN
    │               │            │               │
    │ (Deleted)     │            │ # Security    │  ──► 🆕 NEW
    └───────────────┘            └───────────────┘
```

## Why OTX for Versioning?

1. **Semantic Awareness**: Recognizes that "car" and "automobile" are close.
2. **Shift Invariant**: Moving a sentence within a section doesn't increase the distance.
3. **Heatmap Generation**: Pinpoint exactly which part of a 100-page document needs review.

## Files in this Example

- `doc_v1.md`: Original SRS document.
- `doc_v2.md`: New version with rewritten sections and a new "Security" block.
- `index.js`: The comparison engine.

## Run

```bash
bun examples/nlp-section-drift/index.js
```

## Usage as a Library

```javascript
import { runDriftAnalysis } from './examples/nlp-section-drift';

runDriftAnalysis('path/to/v1.md', 'path/to/v2.md');
```

## Status Meanings

| Status | Meaning |
|--------|---------|
| ✅ STABLE | Minimal or no semantic change. |
| 📝 MODIFIED | Some changes, but mostly the same content. |
| 🚨 REWRITTEN | Significant changes to the core message. |
| 🆕 NEW | Section exists only in the new version. |
| 🗑️ DELETED | Section was removed in the new version. |
