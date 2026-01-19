import { sinkhornDense } from '../src/solvers/sinkhorn_dense.js';
import { otxNano } from '../src/solvers/otx_nano.js';
import { otxBase } from '../src/solvers/otx_base.js';

function generateData(N) {
    const a = new Float64Array(N).fill(1 / N);
    const b = new Float64Array(N).fill(1 / N);
    const sources = Array.from({ length: N }, () => [Math.random(), Math.random()]);
    const targets = Array.from({ length: N }, () => [Math.random(), Math.random()]);
    const C = sources.map(s => targets.map(t => Math.sqrt((s[0] - t[0]) ** 2 + (s[1] - t[1]) ** 2)));
    return { a, b, C, sources, targets };
}

async function run() {
    console.log("🚀 Running 2034 Future-Scaling Benchmark...");
    const sizes = [50, 200, 500];
    const eps = 0.01;

    const latencies = {
        "Dense": [],
        "2030 (SWD)": [],
        "OTX-Base": []
    };

    for (const N of sizes) {
        console.log(`  > Testing N=${N}...`);
        const { a, b, C, sources, targets } = generateData(N);

        const methods = [
            { name: "Dense", fn: () => sinkhornDense(a, b, C, eps) },
            { name: "2030 (SWD)", fn: () => otxNano(a, b, C, eps, sources, targets) },
            { name: "OTX-Base", fn: () => otxBase(a, b, C, eps) }
        ];

        for (const { name, fn } of methods) {
            const start = performance.now();
            fn();
            const end = performance.now();
            latencies[name].push({ N, latency: (end - start).toFixed(2) });
        }
    }

    // Save for LaTeX Line Plots
    const saveCSV = async (name, filename) => {
        const content = "N,Latency\n" + latencies[name].map(d => `${d.N},${d.latency}`).join("\n");
        await Bun.write(`research/${filename}`, content);
    };

    await saveCSV("Dense", "latency_dense.csv");
    await saveCSV("2030 (SWD)", "latency_swd.csv");
    await saveCSV("OTX-Base", "latency_2034.csv");

    console.log("\n✅ Scaling data saved to research/ artifacts.");
    process.exit(0);
}

run();
