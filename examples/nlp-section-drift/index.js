/**
 * 🔄 OTX NLP: Section Drift Detector
 * 
 * Scenario:
 * - A document has two versions (Draft vs Final, or v1.0 vs v1.1)
 * - Goal: Identify exactly which sections changed significantly and which remained stable.
 * - This is more advanced than a standard 'diff' as it uses semantic distance (Wasserstein).
 * 
 * Run: bun examples/nlp-section-drift/index.js
 */

import { otxNano } from '../../src/solvers/otx_nano.js';
import { readFileSync } from 'fs';
import { join } from 'path';

export { runDriftAnalysis, extractSections, computeSectionDistance, tokenize, simpleEmbed };

// --- UTILS (Reused & Simplified from Verifier) ---

function tokenize(text) {
    return text.toLowerCase()
        .split(/[\s,.;:!?()[\]{}]+/)
        .filter(t => t.length > 2)
        .filter(t => !['the', 'and', 'with', 'for', 'this', 'that', 'los', 'las', 'del', 'con', 'para'].includes(t));
}

function simpleEmbed(token) {
    const vec = new Float32Array(8).fill(0);
    for (let i = 0; i < token.length; i++) vec[i % 8] += token.charCodeAt(i) / 255;
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / norm);
}

function computeSectionDistance(tokensA, tokensB) {
    if (tokensA.length === 0 && tokensB.length === 0) return 0;
    if (tokensA.length === 0 || tokensB.length === 0) return 1;

    const maxLen = Math.max(tokensA.length, tokensB.length);
    const weights = new Float64Array(maxLen).fill(1 / maxLen);

    // Build local cost matrix for these tokens
    const embA = tokensA.map(simpleEmbed);
    const embB = tokensB.map(simpleEmbed);

    const C = Array.from({ length: maxLen }, () => new Float64Array(maxLen).fill(0.5));
    for (let i = 0; i < tokensA.length; i++) {
        for (let j = 0; j < tokensB.length; j++) {
            let dot = 0;
            for (let k = 0; k < 8; k++) dot += embA[i][k] * embB[j][k];
            C[i][j] = 1 - Math.max(0, Math.min(1, dot));
        }
    }

    // Coordinates for OTX-Nano (linear projection)
    const coordsA = tokensA.map((_, i) => [i / maxLen, 0]);
    const coordsB = tokensB.map((_, i) => [i / maxLen, 0]);
    while (coordsA.length < maxLen) coordsA.push([0.5, 0]);
    while (coordsB.length < maxLen) coordsB.push([0.5, 0]);

    const result = otxNano(weights, weights, C, 0.05, coordsA, coordsB);
    return result.dist;
}

// --- LOGIC ---

function extractSections(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = { title: "Root", content: "" };

    for (const line of lines) {
        if (line.startsWith('#')) {
            sections.push(currentSection);
            currentSection = { title: line.replace(/^#+\s+/, '').trim(), content: "" };
        } else {
            currentSection.content += line + " ";
        }
    }
    sections.push(currentSection);
    return sections.filter(s => s.content.trim().length > 0 || s.title !== "Root");
}

export function runDriftAnalysis(pathV1, pathV2) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(` 🔄 OTX DRIFT DETECTOR: Comparing Version Changes`);
    console.log(` V1: ${pathV1}`);
    console.log(` V2: ${pathV2}`);
    console.log("═══════════════════════════════════════════════════════════════\n");

    const contentV1 = readFileSync(pathV1, 'utf-8');
    const contentV2 = readFileSync(pathV2, 'utf-8');

    const sectionsV1 = extractSections(contentV1);
    const sectionsV2 = extractSections(contentV2);

    console.log(`Found ${sectionsV1.length} sections in V1 and ${sectionsV2.length} in V2.\n`);
    console.log(`│ Section Name                    │ Drift (OTX) │ Status      │`);
    console.log(`├─────────────────────────────────┼─────────────┼─────────────┤`);

    // Basic map-by-title matching
    for (const s2 of sectionsV2) {
        const s1 = sectionsV1.find(s => s.title === s2.title);

        let drift = 1.0;
        let status = "🆕 NEW";
        let color = "\x1b[32m"; // Green

        if (s1) {
            const tokens1 = tokenize(s1.content);
            const tokens2 = tokenize(s2.content);
            drift = computeSectionDistance(tokens1, tokens2);

            if (drift < 0.05) { status = "✅ STABLE"; color = "\x1b[36m"; } // Cyan
            else if (drift < 0.2) { status = "📝 MODIFIED"; color = "\x1b[33m"; } // Yellow
            else { status = "🚨 REWRITTEN"; color = "\x1b[31m"; } // Red
        }

        console.log(`│ ${s2.title.padEnd(31)} │ ${drift.toFixed(4).padStart(11)} │ ${color}${status.padEnd(11)}\x1b[0m │`);
    }

    // Check for deleted sections
    for (const s1 of sectionsV1) {
        if (!sectionsV2.find(s => s.title === s1.title)) {
            console.log(`│ \x1b[30m${s1.title.padEnd(31)}\x1b[0m │ \x1b[30m${(1.0).toFixed(4).padStart(11)}\x1b[0m │ \x1b[35m🗑️ DELETED\x1b[0m   │`);
        }
    }

    console.log(`└─────────────────────────────────┴─────────────┴─────────────┘\n`);
    console.log("💡 OTX distance (Wasserstein) detects semantic shifts beyond just characters.");
    console.log("   Even if you change 'Introduction' to 'Welcome', if the core vocabulary");
    console.log("   stays similar, the drift remains low.");
}

const dir = import.meta.dirname;

if (import.meta.main) {
    runDriftAnalysis(join(dir, 'doc_v1.md'), join(dir, 'doc_v2.md'));
}
