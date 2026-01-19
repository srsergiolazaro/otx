/**
 * 🔬 OTX Computer Vision: Point Cloud Matching & Registration
 */

import { otxMax } from '../../src/solvers/otx_max.js';
import { otxBase } from '../../src/solvers/otx_base.js';
import { otxNano } from '../../src/solvers/otx_nano.js';

export { generatePointCloud, buildCostMatrix, projectTo2D };

export function generatePointCloud(numPoints, noiseLevel = 0.01, transform = null, seed = 42) {
    let rng = seed;
    const random = () => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; };
    const gaussianNoise = () => {
        const u1 = random(); const u2 = random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * noiseLevel;
    };
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        let x, y, z; const section = random();
        if (section < 0.25) { x = random(); y = random(); z = 0; }
        else if (section < 0.4) { x = 0; y = random(); z = random() * 0.5; }
        else if (section < 0.55) { x = 1; y = random(); z = random() * 0.5; }
        else { x = random(); y = random(); z = random() * 0.3; }
        x += gaussianNoise(); y += gaussianNoise(); z += gaussianNoise();
        if (transform) {
            const { dx, dy, dz, theta } = transform;
            const xNew = x * Math.cos(theta) - y * Math.sin(theta) + dx;
            const yNew = x * Math.sin(theta) + y * Math.cos(theta) + dy;
            x = xNew; y = yNew; z = z + dz;
        }
        points.push([x, y, z]);
    }
    return points;
}

export function buildCostMatrix(cloudA, cloudB) {
    const N = cloudA.length; const C = [];
    for (let i = 0; i < N; i++) {
        const row = [];
        for (let j = 0; j < N; j++) {
            const dx = cloudA[i][0] - cloudB[j][0];
            const dy = cloudA[i][1] - cloudB[j][1];
            const dz = cloudA[i][2] - cloudB[j][2];
            row.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
        }
        C.push(row);
    }
    return C;
}

export function projectTo2D(points) { return points.map(p => [p[0], p[1]]); }

if (import.meta.main) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("  🔬 OTX COMPUTER VISION: Point Cloud Matching Demo");
    console.log("═══════════════════════════════════════════════════════════════");
    const cloudA = generatePointCloud(100);
    const cloudB = generatePointCloud(100, 0.01, { dx: 0.05, dy: 0, dz: 0, theta: 0.035 });
    const N = cloudA.length;
    const weights = new Float64Array(N).fill(1 / N);
    const C = buildCostMatrix(cloudA, cloudB);
    const projA = projectTo2D(cloudA);
    const projB = projectTo2D(cloudB);
    const t = performance.now();
    const result = otxMax(weights, weights, C, 0.05, projA, projB);
    console.log(`│  Wasserstein Distance: ${result.dist.toFixed(4)}                                │`);
    console.log(`│  Latency: ${(performance.now() - t).toFixed(2)} ms                                      │`);
    console.log("═══════════════════════════════════════════════════════════════");
}
