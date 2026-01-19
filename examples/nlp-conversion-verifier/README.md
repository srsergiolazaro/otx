# 📝 NLP: Document Conversion Verifier

> Verify that Markdown → LaTeX conversions preserve semantic content using Optimal Transport.

## The Problem

When converting documents between formats (MD → TeX, TeX → HTML, etc.), content can be lost, corrupted, or mistranslated. Traditional diff tools only catch exact text differences, missing semantic issues.

```
    source.md                    converted.tex
    ┌─────────────┐              ┌─────────────┐
    │ # Title     │   Convert    │ \section{}  │
    │ Content...  │  ───────────►│ Content...  │
    │ ## Section  │              │ \subsection │
    └─────────────┘              └─────────────┘
           │                            │
           └─────────── OTX ────────────┘
                        │
              Semantic Similarity Score
                        │
              ✅ > 90%: Pass
              ⚠️ 70-90%: Warning
              ❌ < 70%: Fail
```

## Why Optimal Transport?

| Challenge | Solution with OTX |
|-----------|-------------------|
| Different syntax (# vs \section) | Compares **content**, not markup |
| Word order changes | Handles **distribution shifts** |
| Partial content loss | Detects **missing sections** |
| Language mix | Works with **any tokens** |

## Run the Example

```bash
bun examples/nlp-conversion-verifier/index.js
```

## Test Cases

| Scenario | Expected Similarity |
|----------|---------------------|
| Perfect conversion | > 95% ✅ |
| Missing section | 70-85% ⚠️ |
| Corrupted/translated | < 50% ❌ |
| Added unauthorized content | 60-80% ⚠️ |

## Integration

## Usage as a Library

```javascript
import { verifyConversion } from './examples/nlp-conversion-verifier';

const result = verifyConversion(markdownText, latexText);
console.log(`Similarity: ${result.similarity}%`);
```

if (result.similarity < 90) {
    console.warn('Conversion may have lost content!');
}
```

## Applications

- 📄 **qtex**: Verify md→tex conversions
- 📚 **Documentation**: Ensure README matches docs
- ⚖️ **Legal**: Contract format migrations
- 🌐 **i18n**: Translation completeness
