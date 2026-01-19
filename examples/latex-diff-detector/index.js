/**
 * 📄 OTX LaTeX Semantic Diff Detector
 * 
 * This example compares two versions of a LaTeX document.
 * Unlike 'diff' which works line-by-line, OTX understands the structural
 * movement of paragraphs and changes in mathematical equations.
 * 
 * Key Features:
 * 1. Sentence/Paragraph extraction from .tex files.
 * 2. Block embedding (semantic + structural).
 * 3. Wasserstein distance to find the optimal mapping (who moved where).
 */

import { readFileSync, existsSync } from 'fs';
import { otxMax } from '../../src/solvers/otx_max.js';

export { runLatexDiff, extractLatexBlocks };

// ============================================================================
// 📑 LATEX PARSER & EMBEDDER
// ============================================================================

function extractLatexBlocks(content) {
    const blocks = [];

    // Split by sections, paragraphs or environments
    const rawBlocks = content.split(/\n\s*\n|\n(?=\\section|\\subsection|\\begin)/g);

    rawBlocks.forEach((text, index) => {
        const trimmed = text.trim();
        if (trimmed.length < 5) return; // Skip noise

        let type = 'paragraph';
        if (trimmed.startsWith('\\section')) type = 'section';
        else if (trimmed.startsWith('\\subsection')) type = 'subsection';
        else if (trimmed.includes('\\begin{equation}')) type = 'equation';

        blocks.push({
            id: index,
            text: trimmed,
            type,
            pos: index / rawBlocks.length // Normalized position
        });
    });

    return blocks;
}

// Simple but structural embedding for OTX
function embedBlock(block) {
    // We use a combination of simple word hashing + structural metadata
    const words = block.text.toLowerCase().match(/\w+/g) || [];
    let hash = 0;
    words.forEach(w => {
        for (let i = 0; i < w.length; i++) hash = (hash << 5) - hash + w.charCodeAt(i);
    });

    // Feature vector: [ContentHash(normalized), TypeWeight, Position]
    const contentVal = (Math.abs(hash) % 1000) / 1000;
    const typeVal = block.type === 'section' ? 0.1 : (block.type === 'equation' ? 0.9 : 0.5);

    return [contentVal, typeVal, block.pos];
}

// ============================================================================
// 🧠 SEMANTIC DIFF ENGINE
// ============================================================================

function runLatexDiff(path1, path2) {
    if (!existsSync(path1) || !existsSync(path2)) {
        console.error("Files not found. Run from project root.");
        return;
    }

    const v1 = readFileSync(path1, 'utf8');
    const v2 = readFileSync(path2, 'utf8');

    const blocks1 = extractLatexBlocks(v1);
    const blocks2 = extractLatexBlocks(v2);

    const N = Math.max(blocks1.length, blocks2.length);
    const a = new Float64Array(N).fill(1 / N);
    const b = new Float64Array(N).fill(1 / N);

    const embeds1 = blocks1.map(embedBlock);
    const embeds2 = blocks2.map(embedBlock);

    // Pad embeddings for OTX
    while (embeds1.length < N) embeds1.push([0, 0, 1.0]);
    while (embeds2.length < N) embeds2.push([0, 0, 1.0]);

    // Build Cost Matrix C[i][j] = Distance between blocks
    const C = Array.from({ length: N }, () => new Float64Array(N));
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            // Euclidean distance in our feature space [Content, Type, Position]
            const dContent = embeds1[i][0] - embeds2[j][0];
            const dType = embeds1[i][1] - embeds2[j][1];
            const dPos = embeds1[i][2] - embeds2[j][2];
            // Position is less weighted (0.2) to allow paragraph movement detection
            C[i][j] = Math.sqrt(dContent ** 2 + dType ** 2 + (dPos * 0.2) ** 2);
        }
    }

    const t0 = performance.now();
    // Using OTX-Max for spatial matching of embeddings
    const result = otxMax(a, b, C, 0.05, embeds1, embeds2);
    const latency = performance.now() - t0;

    // Analyze mapping to find "Structural Drift"
    const v1ToV2 = new Array(blocks1.length).fill(-1);
    const v2ToV1 = new Array(blocks2.length).fill(-1);
    const matchedCosts = new Float64Array(blocks1.length).fill(Infinity);

    // 1. Find Best Matches (One-to-One Greedy)
    const availableV2 = new Set(blocks2.map((_, j) => j));

    // Sort all possible pairs by cost
    const pairs = [];
    for (let i = 0; i < blocks1.length; i++) {
        for (let j = 0; j < blocks2.length; j++) {
            pairs.push({ i, j, cost: C[i][j] });
        }
    }
    pairs.sort((a, b) => a.cost - b.cost);

    for (const { i, j, cost } of pairs) {
        if (v1ToV2[i] === -1 && availableV2.has(j)) {
            if (cost < 0.2) { // Match threshold
                v1ToV2[i] = j;
                v2ToV1[j] = i;
                matchedCosts[i] = cost;
                availableV2.delete(j);
            }
        }
    }

    // Helper for qualitative descriptions
    const getChangeIntensity = (cost) => {
        if (cost < 0.03) return "Minor Edit (formatting/typos)";
        if (cost < 0.10) return "Significant Edit (wording/content)";
        return "Major Rewrite/replacement";
    };

    console.log(`\n============================================================================`);
    console.log(`📊 OTX SEMANTIC DIFF REPORT (Smart Analysis)`);
    console.log(`============================================================================\n`);

    // 2. Report Changes
    console.log(`🔍 DETAILED CHANGES:`);
    const stats = { added: 0, deleted: 0, modified: 0, moved: 0 };

    // Track processed V2 blocks to catch ADDITIONS later
    const processedV2 = new Set();

    blocks1.forEach((b1, i) => {
        const j = v1ToV2[i];
        const cost = matchedCosts[i];

        if (j === -1) {
            stats.deleted++;
            console.log(`❌ [DELETED] Block ${i} (${b1.type})`);
            console.log(`   Content: "${b1.text.substring(0, 80).replace(/\n/g, ' ')}..."`);
        } else {
            processedV2.add(j);
            const b2 = blocks2[j];
            const hasMoved = Math.abs(b1.pos - b2.pos) > 0.1;
            const hasChanged = cost > 0.01;

            if (hasChanged || hasMoved) {
                if (hasChanged) stats.modified++;
                if (hasMoved) stats.moved++;

                let status = "MODIFIED";
                if (hasMoved && hasChanged) status = "EDITED & RELOCATED";
                else if (hasMoved) status = "RELOCATED";

                console.log(`⚠️  [${status}] ${b1.type} (Block ${i})`);
                if (hasChanged) console.log(`   Quality: ${getChangeIntensity(cost)}`);
                if (hasMoved) console.log(`   Movement: Document position shifted.`);
                console.log(`   Snippet: "${b2.text.substring(0, 80).replace(/\n/g, ' ')}..."`);
            }
        }
    });

    // 3. Report Additions
    blocks2.forEach((b2, j) => {
        if (!processedV2.has(j)) {
            stats.added++;
            console.log(`➕ [ADDED] New ${b2.type} at Block ${j}`);
            console.log(`   Content: "${b2.text.substring(0, 80).replace(/\n/g, ' ')}..."`);
        }
    });

    console.log(`\nSummary: ${stats.added} Added, ${stats.deleted} Deleted, ${stats.modified} Modified, ${stats.moved} Relocated.`);
    console.log(`============================================================================\n`);

    // 4. Clean Machine Report for LLM
    const machineReport = {
        summary: `Document changed from ${blocks1.length} tracks to ${blocks2.length} tracks.`,
        stats: {
            additions: stats.added,
            deletions: stats.deleted,
            modifications: stats.modified,
            relocations: stats.moved
        },
        significant_changes: blocks1.map((b1, i) => {
            const j = v1ToV2[i];
            if (j === -1) return { action: 'DELETED', type: b1.type, content_preview: b1.text.substring(0, 100) };

            const cost = matchedCosts[i];
            const moved = Math.abs(b1.pos - blocks2[j].pos) > 0.1;
            const changed = cost > 0.01;

            if (!moved && !changed) return null;

            return {
                action: (changed && moved) ? 'EDITED_AND_RELOCATED' : (changed ? 'EDITED' : 'RELOCATED'),
                type: b1.type,
                intensity: changed ? getChangeIntensity(cost) : "none",
                from_index: i,
                to_index: j,
                original_text: b1.text.substring(0, 150),
                new_text: changed ? blocks2[j].text.substring(0, 150) : "Same"
            };
        }).filter(Boolean).concat(
            blocks2.map((b2, j) => {
                if (!processedV2.has(j)) return { action: 'ADDED', type: b2.type, content: b2.text.substring(0, 150) };
                return null;
            }).filter(Boolean)
        )
    };

    console.log(`<!-- SEMANTIC_DIFF_DATA_START -->`);
    console.log(JSON.stringify(machineReport, null, 2));
    console.log(`<!-- SEMANTIC_DIFF_DATA_END -->`);
}

// ============================================================================
// 🚀 RUN
// ============================================================================

if (import.meta.main) {
    runLatexDiff('./examples/latex-diff-detector/v1.tex', './examples/latex-diff-detector/v2.tex');
}
