import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function listTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...listTs(path));
    } else if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
      out.push(path);
    }
  }
  return out;
}

describe("engine isolation", () => {
  it("does not import cocos or browser game engines", () => {
    const src = fileURLToPath(new URL(".", import.meta.url));
    const banned = ["from \"cc\"", "from 'cc'", "from \"phaser\"", "from 'phaser'"];
    for (const file of listTs(src)) {
      const text = readFileSync(file, "utf8");
      for (const token of banned) {
        expect(text.includes(token), `${file} contains ${token}`).toBe(false);
      }
    }
  });
});
