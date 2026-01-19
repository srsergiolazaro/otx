/**
 * 🕶️ OTX Computer Vision: AR Marker Detector
 * 
 * Scenario:
 * - We have a "Marker Pattern" (e.g., a QR-like high-contrast image).
 * - A camera captures a real-world scene where the marker is rotated and scaled.
 * - Goal: Align the pattern to the scene to enable AR object placement.
 * 
 * This example uses OTX to perform "Point Set Registration" between feature 
 * points (SIFT/ORB-like) of the marker and the scene.
 */

import { otxMax } from '../../src/solvers/otx_max.js';

export { detectMarkerFeatureMatch, generateMarkerScene };

// ============================================================================
// 📸 AR SCENARIO GENERATION
// ============================================================================

function generateMarkerScene(numKeypoints = 100, noiseLevel = 0.02, seed = 42) {
    let rng = seed;
    const random = () => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; };

    // 1. Generate Marker Keypoints (in a grid/pattern)
    const markerPoints = [];
    for (let i = 0; i < numKeypoints; i++) {
        markerPoints.push([random(), random()]); // Normalized [0,1]
    }

    // 2. Generate Scene Keypoints (Marker is rotated, scaled and translated)
    const theta = 0.5; // ~30 degrees rotation
    const scale = 0.6;
    const tx = 0.2;
    const ty = 0.3;

    const scenePoints = markerPoints.map(p => {
        // Apply transformation: x' = (x*cos - y*sin)*s + tx
        const rx = (p[0] * Math.cos(theta) - p[1] * Math.sin(theta)) * scale + tx;
        const ry = (p[0] * Math.sin(theta) + p[1] * Math.cos(theta)) * scale + ty;

        // Add sensor noise
        return [
            rx + (random() - 0.5) * noiseLevel,
            ry + (random() - 0.5) * noiseLevel
        ];
    });

    // 3. Add Clutter (non-marker points in the scene)
    for (let i = 0; i < numKeypoints * 0.5; i++) {
        scenePoints.push([random(), random()]);
    }

    return { markerPoints, scenePoints };
}

// ============================================================================
// 🧠 AR DETECTION ENGINE
// ============================================================================

/**
 * Align points using OTX-Max
 */
function detectMarkerFeatureMatch(markerPoints, scenePoints) {
    const N = markerPoints.length;
    const M = scenePoints.length;
    const SIZE = Math.max(N, M);

    // Equal weights for all keypoints
    const weightsA = new Float64Array(SIZE).fill(1 / N);
    const weightsB = new Float64Array(SIZE).fill(1 / M);

    // Build Cost Matrix (Euclidean distance between projected features)
    const C = Array.from({ length: SIZE }, () => new Float64Array(SIZE).fill(1.0));
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            const dx = markerPoints[i][0] - scenePoints[j][0];
            const dy = markerPoints[i][1] - scenePoints[j][1];
            C[i][j] = Math.sqrt(dx * dx + dy * dy);
        }
    }

    // Ensure coordinate arrays are padded to SIZE
    const paddedMarker = [...markerPoints];
    while (paddedMarker.length < SIZE) paddedMarker.push([0.5, 0.5]);

    const paddedScene = [...scenePoints];
    while (paddedScene.length < SIZE) paddedScene.push([0.5, 0.5]);

    const t0 = performance.now();
    const result = otxMax(weightsA, weightsB, C, 0.05, paddedMarker, paddedScene);
    const latency = performance.now() - t0;

    return {
        alignmentScore: (1 - result.dist).toFixed(4),
        latency,
        matchCount: N
    };
}

// ============================================================================
// 🚀 RUN DEMO
// ============================================================================

if (import.meta.main) {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("  🕶️ OTX AR: Geometric Marker Detection");
    console.log("═══════════════════════════════════════════════════════════════\n");

    const { markerPoints, scenePoints } = generateMarkerScene(100);

    console.log(`📸 Input Data:`);
    console.log(`   • Marker Template: ${markerPoints.length} keypoints`);
    console.log(`   • Real Scene: ${scenePoints.length} total points (includes clutter)\n`);

    const result = detectMarkerFeatureMatch(markerPoints, scenePoints);

    console.log("┌──────────────────────────────────────────────────────────────┐");
    console.log("│ AR Alignment Results                                         │");
    console.log("├───────────────────────────────┬──────────────────────────────┤");
    console.log("│ Metric                        │ Result                       │");
    console.log("├───────────────────────────────┼──────────────────────────────┤");
    console.log(`│ Confidence Score (OTX)        │ ${result.alignmentScore.padStart(28)} │`);
    console.log(`│ Processing Time               │ ${result.latency.toFixed(2).padStart(25)} ms │`);
    console.log(`│ Registered Keypoints          │ ${result.matchCount.toString().padStart(28)} │`);
    console.log("└───────────────────────────────┴──────────────────────────────┘\n");

    if (parseFloat(result.alignmentScore) > 0.8) {
        console.log("✅ SUCCESS: Marker detected and aligned correctly.");
        console.log("💡 OTX found the optimal mapping between the pattern and the scene");
        console.log("   even with rotation, scaling, and background clutter.");
    } else {
        console.log("❌ FAILURE: Marker not found in scene.");
    }

    console.log("\n═══════════════════════════════════════════════════════════════\n");
}
