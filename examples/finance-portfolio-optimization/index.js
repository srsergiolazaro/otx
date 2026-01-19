/**
 * 💰 OTX Finance: Portfolio Optimization & Rebalancing
 */

import { otxMax } from '../../src/solvers/otx_max.js';
import { otxBase } from '../../src/solvers/otx_base.js';
import { otxNano } from '../../src/solvers/otx_nano.js';

export { buildCostMatrix, embedPortfolio, generateLargePortfolio, generateCostMatrix, generateCoords };

const assets = [
    { ticker: "AAPL", name: "Apple Inc.", sector: "Tech", tradingCost: 0.001 },
    { ticker: "MSFT", name: "Microsoft", sector: "Tech", tradingCost: 0.001 },
    { ticker: "JPM", name: "JP Morgan", sector: "Finance", tradingCost: 0.0008 },
    { ticker: "XOM", name: "Exxon Mobil", sector: "Energy", tradingCost: 0.0009 },
];

export function buildCostMatrix(assets) {
    const N = assets.length; const C = [];
    for (let i = 0; i < N; i++) {
        const row = [];
        for (let j = 0; j < N; j++) {
            if (i === j) row.push(0);
            else row.push((assets[i].tradingCost + assets[j].tradingCost) / 2);
        }
        C.push(row);
    }
    return C;
}

export function embedPortfolio(assets) {
    return assets.map((_, i) => [Math.random(), Math.random()]);
}

export function generateLargePortfolio(size) {
    const weights = new Float64Array(size); let sum = 0;
    for (let i = 0; i < size; i++) { weights[i] = Math.random(); sum += weights[i]; }
    for (let i = 0; i < size; i++) weights[i] /= sum;
    return weights;
}

export function generateCostMatrix(size) {
    const C = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) row.push(i === j ? 0 : 0.001 + Math.random() * 0.005);
        C.push(row);
    }
    return C;
}

export function generateCoords(size) {
    return Array.from({ length: size }, () => [Math.random(), Math.random()]);
}

if (import.meta.main) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("  💰 OTX FINANCE: Portfolio Optimization Demo");
    console.log("═══════════════════════════════════════════════════════════════");
    const current = new Float64Array([0.4, 0.3, 0.2, 0.1]);
    const target = new Float64Array([0.25, 0.25, 0.25, 0.25]);
    const C = buildCostMatrix(assets);
    const coords = embedPortfolio(assets);
    const t = performance.now();
    const result = otxMax(current, target, C, 0.001, coords, coords);
    console.log(`│  Transaction Cost: ${(result.dist * 10000).toFixed(1)} bps                            │`);
    console.log(`│  Latency: ${(performance.now() - t).toFixed(2)} ms                                      │`);
    console.log("═══════════════════════════════════════════════════════════════");
}
