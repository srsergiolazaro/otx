# 📄 LaTeX Semantic Diff Detector

This example demonstrates how OTX can be used as a **Structural & Semantic Diff** tool for large documents (scientific papers, legal contracts). 

Traditional `diff` tools compare lines of text. If you move a paragraph from Section 1 to Section 3, `diff` will show a deletion and an insertion. **OTX understands it just moved.**

## How it works

1.  **Parsing**: Segments the `.tex` file into logical blocks (Sections, Paragraphs, Equations).
2.  **Structural Embedding**: Each block is converted into a 3D coordinate: `[Hash_Content, Block_Type, Position]`.
3.  **Optimal Transport**: OTX finds the most efficient mapping (minimum work) to transform the "Cloud of Blocks" of Version 1 into Version 2.
4.  **Drift Detection**: 
    *   **High Cost match**: The block was edited.
    *   **Distance match**: The block was moved.
    *   **Unmatched mass**: New content was added or deleted.

## Run

```bash
bun examples/latex-diff-detector/index.js
```

## Example Scenario

- `v1.tex`: Original paper structure.
- `v2.tex`: A paragraph from "Introduction" is moved to "Methodology", and a variable $\alpha$ is added to an equation.

OTX will detect the "Movement" distance and the "Editing" cost of the equation, providing a global distance metric for the document's evolution.
