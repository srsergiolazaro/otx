/**
 * Naive Sinkhorn-Knopp algorithm for Entropic Optimal Transport.
 * Warning: Numerically unstable for small epsilon.
 * 
 * @param {number[]} a - Source distribution (histogram) of size N
 * @param {number[]} b - Target distribution (histogram) of size M
 * @param {number[][]} C - Cost matrix of shape (N, M)
 * @param {number} epsilon - Regularization strength
 * @param {number} maxIter - Maximum number of iterations
 * @param {number} tol - Convergence tolerance
 * @returns {object} { P: coupling matrix, dist: Sinkhorn distance }
 */
export function sinkhornDense(a, b, C, epsilon, maxIter = 1000, tol = 1e-9) {
    const N = a.length;
    const M = b.length;

    // Gibbs Kernel: K = exp(-C / epsilon)
    const K = C.map(row => row.map(c => Math.exp(-c / epsilon)));

    let u = new Array(N).fill(1.0);
    let v = new Array(M).fill(1.0);

    for (let iter = 0; iter < maxIter; iter++) {
        const uPrev = [...u];

        // v = b / (K.T @ u)
        for (let j = 0; j < M; j++) {
            let Kv = 0;
            for (let i = 0; i < N; i++) {
                Kv += K[i][j] * u[i];
            }
            v[j] = b[j] / (Kv + 1e-30); // Epsilon for stability
        }

        // u = a / (K @ v)
        for (let i = 0; i < N; i++) {
            let Ku = 0;
            for (let j = 0; j < M; j++) {
                Ku += K[i][j] * v[j];
            }
            u[i] = a[i] / (Ku + 1e-30);
        }

        // Check convergence
        let diff = 0;
        for (let i = 0; i < N; i++) {
            diff += Math.abs(u[i] - uPrev[i]);
        }
        if (diff < tol) break;
    }

    // P = u * K * v (Transport Plan)
    const P = K.map((row, i) => row.map((k, j) => u[i] * k * v[j]));

    // Cost = sum(P * C)
    let dist = 0;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            dist += P[i][j] * C[i][j];
        }
    }

    return { P, dist };
}
