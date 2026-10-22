#!/usr/bin/env node
import { benchSims, formatBench } from "./bench.ts";
import type { SimTier } from "./observe.ts";

function arg(flag: string, fallback: string): string {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

const tier = (arg("--tier", "all") as SimTier | "all");
const seeds = Number(arg("--seeds", "8"));
const rows = benchSims({ tier, seeds, maxWaves: Number(arg("--max-waves", "200")) });
console.log(formatBench(rows));
