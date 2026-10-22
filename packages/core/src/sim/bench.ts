import { runSim, type SimResult } from "./run-sim.ts";
import type { SimTier } from "./observe.ts";

export interface BenchRow {
  tier: SimTier;
  seeds: number;
  meanWave: number;
  clearRate: number;
  results: SimResult[];
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

export function benchSims(opts: { tier: SimTier | "all"; seeds: number; prefix?: string; maxWaves?: number }): BenchRow[] {
  const tiers: SimTier[] = opts.tier === "all" ? ["low", "mid", "high"] : [opts.tier];
  const prefix = opts.prefix ?? "bench";
  return tiers.map((tier) => {
    const results: SimResult[] = [];
    for (let i = 0; i < opts.seeds; i++) {
      results.push(
        runSim({
          seed: `${prefix}-${i}`,
          tier,
          maxWaves: opts.maxWaves ?? 200,
        }),
      );
    }
    const waves = results.map((row) => row.wave);
    return {
      tier,
      seeds: opts.seeds,
      meanWave: mean(waves),
      clearRate: results.filter((row) => row.reason === "victory").length / Math.max(1, results.length),
      results,
    };
  });
}

export function formatBench(rows: BenchRow[]): string {
  return rows
    .map((row) => {
      const reasons = row.results.reduce<Record<string, number>>((acc, item) => {
        acc[item.reason] = (acc[item.reason] ?? 0) + 1;
        return acc;
      }, {});
      const why = Object.entries(reasons)
        .map(([key, count]) => `${key}:${count}`)
        .join(",");
      return `${row.tier}  n=${row.seeds}  均波 ${row.meanWave.toFixed(1)}  通关 ${(row.clearRate * 100).toFixed(0)}%  ${why}`;
    })
    .join("\n");
}
