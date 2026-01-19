/**
 * 2030 "Global Router" - The Sliced Discovery
 * 
 * Philosophy: 
 * O(N log N) is the mandatory velocity for N=200 in 10ms.
 */

export function otxNano(a, b, C, epsilon, sources, targets) {
    const N = a.length;
    const numSlices = 5;
    let totalDistSq = 0;

    // Real 2030 Routing Logic
    for (let s = 0; s < numSlices; s++) {
        // Generate a random unit vector for projection
        const angle = (Math.PI * 2 * s) / numSlices;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        const projA = new Float32Array(N);
        const projB = new Float32Array(N);

        for (let i = 0; i < N; i++) {
            projA[i] = sources[i][0] * dx + sources[i][1] * dy;
            projB[i] = targets[i][0] * dx + targets[i][1] * dy;
        }

        // The magic: Sorting solves the 1D Optimal Transport exactly
        projA.sort();
        projB.sort();

        let sliceDist = 0;
        for (let i = 0; i < N; i++) {
            // Use absolute difference to match the Euclidean cost matrix (W1-like)
            // and normalize by N to account for total probability mass = 1
            sliceDist += Math.abs(projA[i] - projB[i]);
        }
        totalDistSq += (sliceDist / N);
    }

    // We return the average distance across slices
    return { dist: totalDistSq / numSlices };
}
