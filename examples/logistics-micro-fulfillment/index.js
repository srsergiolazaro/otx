/**
 * ⚡ OTX Logistics: Micro-Fulfillment (Dark Stores) Optimization
 */

import { otxMax } from '../../src/solvers/otx_max.js';

export { dispatchAdvanced, generateUrbanScenario };

function generateUrbanScenario(numStores = 5, numOrders = 100, seed = 88) {
    let rng = seed;
    const random = () => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; };
    const stores = [];
    const names = ["Downtown-East", "Brickell-Hub", "Wynwood-Express", "Little-Havana", "Midtown-Dark"];
    for (let i = 0; i < numStores; i++) {
        stores.push({
            id: i, name: names[i] || `Store-${i}`, x: random(), y: random(),
            capacity: 20 + Math.floor(random() * 30),
            congestion: 0.1 + (random() * 0.9)
        });
    }
    const orders = [];
    for (let i = 0; i < numOrders; i++) {
        orders.push({
            id: i, x: random(), y: random(),
            priority: random() < 0.2 ? 2.0 : 1.0,
            units: 1 + Math.floor(random() * 3)
        });
    }
    return { stores, orders };
}

function dispatchAdvanced(stores, orders) {
    const N = stores.length;
    const M = orders.length;
    const SIZE = Math.max(N, M);

    const supplyVals = stores.map(s => s.capacity * (1.1 - s.congestion));
    const totalAvail = supplyVals.reduce((a, b) => a + b, 0);
    const a = new Float64Array(SIZE).fill(0);
    supplyVals.forEach((v, i) => a[i] = v / totalAvail);

    const demandVals = orders.map(o => o.units * o.priority);
    const totalDem = demandVals.reduce((a, b) => a + b, 0);
    const b = new Float64Array(SIZE).fill(0);
    demandVals.forEach((v, i) => b[i] = v / totalDem);

    const C = Array.from({ length: SIZE }, () => new Float64Array(SIZE).fill(1.0));
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            const dist = Math.sqrt((stores[i].x - orders[j].x) ** 2 + (stores[i].y - orders[j].y) ** 2);
            C[i][j] = dist * (1 + (stores[i].congestion ** 2));
        }
    }

    const storeCoords = stores.map(s => [s.x, s.y]);
    while (storeCoords.length < SIZE) storeCoords.push([0.5, 0.5]);
    const orderCoords = orders.map(o => [o.x, o.y]);
    while (orderCoords.length < SIZE) orderCoords.push([0.5, 0.5]);

    const t0 = performance.now();
    const result = otxMax(a, b, C, 0.05, storeCoords, orderCoords);
    return {
        dist: result.dist,
        latency: performance.now() - t0,
        storeLoads: stores.map((s, i) => ({
            name: s.name, load: (a[i] * 100).toFixed(1) + "%", congestion: (s.congestion * 100).toFixed(0) + "%"
        }))
    };
}

if (import.meta.main) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("  ⚡ OTX ADVANCED LOGISTICS: Micro-Fulfillment Dark Stores");
    console.log("═══════════════════════════════════════════════════════════════\n");
    const { stores, orders } = generateUrbanScenario(5, 100);
    const result = dispatchAdvanced(stores, orders);
    console.log("┌──────────────────────┬────────────┬──────────────────────────┐");
    console.log("│ Dark Store Name      │ Congestion │ Global Dispatch Load     │");
    console.log("├──────────────────────┼────────────┼──────────────────────────┤");
    result.storeLoads.forEach(s => {
        console.log(`│ ${s.name.padEnd(20)} │ ${s.congestion.padStart(10)} │ ${s.load.padStart(24)} │`);
    });
    console.log("└──────────────────────┴────────────┴──────────────────────────┘\n");
    console.log(`📈 Efficiency: ${result.dist.toFixed(4)} | Latency: ${result.latency.toFixed(2)} ms`);
    console.log("\n═══════════════════════════════════════════════════════════════\n");
}
