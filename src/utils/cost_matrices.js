/**
 * Computes the squared Euclidean distance between two vectors or sets of vectors.
 * @param {number[][]} X - Matrix of shape (N, D)
 * @param {number[][]} Y - Matrix of shape (M, D)
 * @returns {number[][]} Cost matrix of shape (N, M)
 */
export function squaredEuclidean(X, Y) {
    const N = X.length;
    const M = Y.length;
    const C = Array.from({ length: N }, () => new Array(M));

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            let dist = 0;
            for (let k = 0; k < X[0].length; k++) {
                dist += (X[i][k] - Y[j][k]) ** 2;
            }
            C[i][j] = dist;
        }
    }
    return C;
}

/**
 * Normalizes a vector to sum to 1, creating a probability distribution.
 * @param {number[]} v 
 * @returns {number[]}
 */
export function normalize(v) {
    const sum = v.reduce((a, b) => a + b, 0);
    return v.map((x) => x / sum);
}

/**
 * Generates a random probability distribution of size N.
 * @param {number} N 
 * @returns {number[]}
 */
export function randomLatent(N) {
    const v = Array.from({ length: N }, () => Math.random());
    return normalize(v);
}
