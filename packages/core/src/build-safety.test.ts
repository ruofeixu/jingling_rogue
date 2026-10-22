import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)));

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
      continue;
    }
    if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Cocos Creator 的脚本构建把数组展开降级成 `[].concat(x)`，这对数组正确，对 Set 这类
 * 非数组可迭代对象是错的：Set 会被当成单个元素塞进数组。实测后果见
 * docs/superpowers/plans/2026-08-31-V0-build-runtime-blockers.md 的 V0-4：
 * `new Set([...A, ...B])` 变成装着两个 Set 的 Set，`PORTRAIT_IDS.has(id)` 永远 false；
 * `[...new Set([...codex, id])]` 变成 `[Set]`，随后 getSpirit(Set) 抛
 * `unknown spirit: [object Set]`，开局直接失败。运行时代码必须用 Array.from。
 */
describe("build-safe iteration", () => {
  it("never spreads a Set with array spread in runtime code", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const text = readFileSync(file, "utf8");
      text.split("\n").forEach((line, index) => {
        if (/\[\s*\.\.\.\s*new Set\s*\(/.test(line) || /\.\.\.\s*new Set\s*\(/.test(line)) {
          offenders.push(`${relative(SRC, file)}:${index + 1} ${line.trim()}`);
        }
        if (/\.\.\.\s*(?:FIRST_PORTRAITS|SECOND_PORTRAITS|THIRD_PORTRAITS|PORTRAIT_IDS|CARTOON_PORTRAIT_IDS)\b/.test(line)) {
          offenders.push(`${relative(SRC, file)}:${index + 1} ${line.trim()}`);
        }
      });
    }

    expect(offenders, "use Array.from(...) so Creator's loose transpile keeps iterating").toEqual([]);
  });
});
