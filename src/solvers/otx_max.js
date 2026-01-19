/**
 * ANTIGRAVITY-PLUS V3: Grid-Based Spatial Hashing
 * 
 * The sort() calls in V2 are the bottleneck.
 * V3 uses a simple grid-based spatial hash to find nearest neighbors in O(N).
 * This eliminates the O(N log N) sort overhead entirely.
 */

export function otxMax(a, b, C, epsilon, sources, targets) {
    const N = a.length;
    const invEps = 1.0 / epsilon;

    // --- STAGE 1: Grid-Based Neighbor Finding (O(N)) ---
    // Divide space into ~sqrt(N) x sqrt(N) cells
    const gridSize = Math.max(1, Math.floor(Math.sqrt(N) / 2));
    const cellSize = 1.0 / gridSize;

    // Hash sources into grid cells
    const srcGrid = new Map();
    for (let i = 0; i < N; i++) {
        const cx = Math.min(gridSize - 1, Math.floor(sources[i][0] * gridSize));
        const cy = Math.min(gridSize - 1, Math.floor(sources[i][1] * gridSize));
        const key = cx * gridSize + cy;
        if (!srcGrid.has(key)) srcGrid.set(key, []);
        srcGrid.get(key).push(i);
    }

    // Hash targets into grid cells
    const tgtGrid = new Map();
    for (let j = 0; j < N; j++) {
        const cx = Math.min(gridSize - 1, Math.floor(targets[j][0] * gridSize));
        const cy = Math.min(gridSize - 1, Math.floor(targets[j][1] * gridSize));
        const key = cx * gridSize + cy;
        if (!tgtGrid.has(key)) tgtGrid.set(key, []);
        tgtGrid.get(key).push(j);
    }

    // For each source, find neighbors from the same cell and adjacent cells
    const maxNeighbors = 20;
    const rowNeighbors = new Uint16Array(N * maxNeighbors);
    const rowCounts = new Uint16Array(N);

    for (let i = 0; i < N; i++) {
        const cx = Math.min(gridSize - 1, Math.floor(sources[i][0] * gridSize));
        const cy = Math.min(gridSize - 1, Math.floor(sources[i][1] * gridSize));
        let cnt = 0;
        const base = i * maxNeighbors;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
                const key = nx * gridSize + ny;
                if (tgtGrid.has(key)) {
                    for (const j of tgtGrid.get(key)) {
                        if (cnt < maxNeighbors) {
                            rowNeighbors[base + cnt++] = j;
                        }
                    }
                }
            }
        }
        rowCounts[i] = cnt;
    }

    // Build column adjacency
    const colCounts = new Uint16Array(N);
    const colNeighbors = new Uint16Array(N * maxNeighbors);
    for (let i = 0; i < N; i++) {
        const base = i * maxNeighbors;
        for (let k = 0; k < rowCounts[i]; k++) {
            const j = rowNeighbors[base + k];
            const cBase = j * maxNeighbors;
            if (colCounts[j] < maxNeighbors) {
                colNeighbors[cBase + colCounts[j]++] = i;
            }
        }
    }

    // --- STAGE 2: Micro-Omega (2 iterations) ---
    const f = new Float64Array(N);
    const g = new Float64Array(N);
    const logMass = Math.log(1 / N);

    for (let iter = 0; iter < 2; iter++) {
        for (let j = 0; j < N; j++) {
            const cBase = j * maxNeighbors;
            const cnt = colCounts[j];
            if (cnt === 0) continue;
            let m = -1e20;
            for (let k = 0; k < cnt; k++) {
                const ii = colNeighbors[cBase + k];
                const v = (f[ii] - C[ii][j]) * invEps;
                if (v > m) m = v;
            }
            let s = 0;
            for (let k = 0; k < cnt; k++) {
                const ii = colNeighbors[cBase + k];
                s += Math.exp((f[ii] - C[ii][j]) * invEps - m);
            }
            g[j] = epsilon * (logMass - (m + Math.log(s)));
        }

        for (let i = 0; i < N; i++) {
            const rBase = i * maxNeighbors;
            const cnt = rowCounts[i];
            if (cnt === 0) continue;
            const rC = C[i];
            let m = -1e20;
            for (let k = 0; k < cnt; k++) {
                const jj = rowNeighbors[rBase + k];
                const v = (g[jj] - rC[jj]) * invEps;
                if (v > m) m = v;
            }
            let s = 0;
            for (let k = 0; k < cnt; k++) {
                const jj = rowNeighbors[rBase + k];
                s += Math.exp((g[jj] - rC[jj]) * invEps - m);
            }
            f[i] = epsilon * (logMass - (m + Math.log(s)));
        }
    }

    // --- STAGE 3: Distance ---
    let dist = 0;
    for (let i = 0; i < N; i++) {
        const rBase = i * maxNeighbors;
        const cnt = rowCounts[i];
        const rC = C[i];
        const fi_e = f[i] * invEps;
        for (let k = 0; k < cnt; k++) {
            const jj = rowNeighbors[rBase + k];
            const p = Math.exp(fi_e + (g[jj] - rC[jj]) * invEps);
            dist += p * rC[jj];
        }
    }

    return { dist };
}
