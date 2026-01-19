/**
 * 🚚 OTX Logistics Example: Warehouse to Customer Delivery Optimization
 */

import { otxMax } from '../src/solvers/otx_max.js';
import { otxBase } from '../src/solvers/otx_base.js';
import { otxNano } from '../src/solvers/otx_nano.js';

export { solveDeliveryProblem, generateCustomers };

const warehouses = [
    { name: "Warehouse A (Downtown)", x: 0.5, y: 0.5, inventory: 150 },
    { name: "Warehouse B (Airport)", x: 0.2, y: 0.3, inventory: 200 },
    { name: "Warehouse C (Port)", x: 0.8, y: 0.2, inventory: 100 },
    { name: "Warehouse D (North)", x: 0.4, y: 0.9, inventory: 50 },
];

export function generateCustomers(count, seed = 42) {
    const customers = [];
    let rng = seed;
    const random = () => {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        return rng / 0x7fffffff;
    };

    for (let i = 0; i < count; i++) {
        customers.push({
            id: i + 1,
            x: random(),
            y: random(),
            demand: Math.floor(random() * 5) + 1
        });
    }
    return customers;
}

export function solveDeliveryProblem(warehouses, customers) {
    const numSources = warehouses.length;
    const numTargets = customers.length;
    const totalSupply = warehouses.reduce((sum, w) => sum + w.inventory, 0);
    const totalDemand = customers.reduce((sum, c) => sum + c.demand, 0);

    const sourceWeights = warehouses.map(w => w.inventory / totalSupply);
    const targetWeights = customers.map(c => c.demand / totalDemand);

    const KM_SCALE = 50;
    const costMatrix = [];
    for (let i = 0; i < numSources; i++) {
        const row = [];
        for (let j = 0; j < numTargets; j++) {
            const dx = warehouses[i].x - customers[j].x;
            const dy = warehouses[i].y - customers[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy) * KM_SCALE;
            row.push(distance);
        }
        costMatrix.push(row);
    }

    const N = Math.max(numSources, numTargets);
    const expandedSources = new Float64Array(N).fill(0);
    const expandedTargets = new Float64Array(N).fill(0);
    const expandedCost = Array.from({ length: N }, () => new Array(N).fill(1000));

    for (let i = 0; i < numSources; i++) expandedSources[i] = sourceWeights[i];
    for (let j = 0; j < numTargets; j++) expandedTargets[j] = targetWeights[j];
    for (let i = 0; i < numSources; i++) {
        for (let j = 0; j < numTargets; j++) {
            expandedCost[i][j] = costMatrix[i][j];
        }
    }

    const sourceCoords = warehouses.map(w => [w.x, w.y]);
    while (sourceCoords.length < N) sourceCoords.push([0.5, 0.5]);
    const targetCoords = customers.map(c => [c.x, c.y]);
    while (targetCoords.length < N) targetCoords.push([0.5, 0.5]);

    const epsilon = 0.05;
    const t1 = performance.now();
    const nanoResult = otxNano(expandedSources, expandedTargets, expandedCost, epsilon, sourceCoords, targetCoords);
    const nanoTime = performance.now() - t1;

    const t2 = performance.now();
    const baseResult = otxBase(expandedSources, expandedTargets, expandedCost, epsilon);
    const baseTime = performance.now() - t2;

    const t3 = performance.now();
    const maxResult = otxMax(expandedSources, expandedTargets, expandedCost, epsilon, sourceCoords, targetCoords);
    const maxTime = performance.now() - t3;

    return {
        nano: { distance: nanoResult.dist, time: nanoTime },
        base: { distance: baseResult.dist, time: baseTime },
        max: { distance: maxResult.dist, time: maxTime }
    };
}

if (import.meta.main) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("  🚚 OTX LOGISTICS DEMO: Warehouse-to-Customer Optimization");
    console.log("═══════════════════════════════════════════════════════════════");

    const count = 100;
    const customers = generateCustomers(count);
    const result = solveDeliveryProblem(warehouses, customers);

    console.log(`│  Solver      │  Distance (km)  │  Latency              │`);
    console.log(`├──────────────────────────────────────────────────────────┤`);
    console.log(`│  OTX-Nano    │  ${result.nano.distance.toFixed(2).padStart(10)}     │  ${result.nano.time.toFixed(2).padStart(8)} ms          │`);
    console.log(`│  OTX-Base    │  ${result.base.distance.toFixed(2).padStart(10)}     │  ${result.base.time.toFixed(2).padStart(8)} ms          │`);
    console.log(`│  OTX-Max     │  ${result.max.distance.toFixed(2).padStart(10)}     │  ${result.max.time.toFixed(2).padStart(8)} ms          │`);
    console.log(`└──────────────────────────────────────────────────────────┘`);
}
