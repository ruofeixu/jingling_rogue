import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url));

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
 * presentation 是纯 TypeScript 层：只能依赖 packages/core，不得导入引擎或设备 API。
 * 契约来自 docs/adr/0001-ui-presentation-shell.md 的四层边界。
 */
describe("presentation isolation", () => {
  const files = sourceFiles(SRC);

  it("actually inspects the package sources", () => {
    expect(files.length).toBeGreaterThan(3);
  });

  it("never imports the Cocos engine", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (/from\s+["']cc["']/.test(text) || /require\(\s*["']cc["']\s*\)/.test(text)) {
        offenders.push(relative(SRC, file));
      }
    }

    expect(offenders).toEqual([]);
  });

  it("never touches device or DOM APIs", () => {
    const forbidden = ["document.", "window.", "navigator.", "wx.", "tt.", "requestAnimationFrame"];
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const token of forbidden) {
        if (text.includes(token)) {
          offenders.push(`${relative(SRC, file)} -> ${token}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
