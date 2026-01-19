/**
 * 📝 OTX NLP: Document Conversion Verifier
 */

import { otxMax } from '../../src/solvers/otx_max.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export { verifyConversion, parseMarkdown, parseLatex, tokenize, simpleEmbed, buildCostMatrix };

const dir = import.meta.dirname;
const sourcePath = join(dir, 'source.md');
const targetPath = join(dir, 'target.tex');

let fileMarkdown = "";
let fileLatex = "";

if (existsSync(sourcePath) && existsSync(targetPath)) {
    fileMarkdown = readFileSync(sourcePath, 'utf-8');
    fileLatex = readFileSync(targetPath, 'utf-8');
}

export function parseMarkdown(md) {
    return md.replace(/```[\s\S]*?```/g, ' CODE_BLOCK ').replace(/^#{1,6}\s+/gm, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\s+/g, ' ').trim();
}

export function parseLatex(tex) {
    return tex.replace(/%.*$/gm, '').replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

export function tokenize(text) {
    return text.toLowerCase().split(/[\s,.;:!?()[\]{}]+/).filter(t => t.length > 1);
}

export function simpleEmbed(token) {
    const vec = new Float32Array(8).fill(0);
    for (let i = 0; i < token.length; i++) vec[i % 8] += token.charCodeAt(i) / 255;
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / norm);
}

export function buildCostMatrix(tokensA, tokensB) {
    const embA = tokensA.map(simpleEmbed);
    const embB = tokensB.map(simpleEmbed);
    const C = [];
    for (let i = 0; i < embA.length; i++) {
        const row = [];
        for (let j = 0; j < embB.length; j++) {
            let dot = 0; for (let k = 0; k < 8; k++) dot += embA[i][k] * embB[j][k];
            row.push(1 - Math.max(0, Math.min(1, dot)));
        }
        C.push(row);
    }
    return C;
}

export function verifyConversion(markdown, latex) {
    const mdTokens = tokenize(parseMarkdown(markdown));
    const texTokens = tokenize(parseLatex(latex));
    const maxLen = Math.max(mdTokens.length, texTokens.length);
    if (maxLen === 0) return { similarity: 100, distance: 0 };
    while (mdTokens.length < maxLen) mdTokens.push('_PAD_');
    while (texTokens.length < maxLen) texTokens.push('_PAD_');
    const C = buildCostMatrix(mdTokens, texTokens);
    const weights = new Float64Array(maxLen).fill(1 / maxLen);
    const coords = mdTokens.map((_, i) => [i / maxLen, 0.5]);
    const result = otxMax(weights, weights, C, 0.05, coords, coords);
    return {
        similarity: Math.max(0, (1 - result.dist) * 100).toFixed(1),
        distance: result.dist.toFixed(4)
    };
}

if (import.meta.main) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("  📝 OTX NLP: Document Conversion Verifier");
    console.log("═══════════════════════════════════════════════════════════════");
    const result = verifyConversion(fileMarkdown || "# Intro", fileLatex || "\\section{Intro}");
    console.log(`│  Similitud Semántica: ${result.similarity.padStart(5)}%                                │`);
    console.log("═══════════════════════════════════════════════════════════════");
}
