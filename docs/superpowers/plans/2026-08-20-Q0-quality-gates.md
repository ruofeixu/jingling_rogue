# Q0 质量门 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 把可玩/易用门焊进 `pnpm test`：40 种子低档均波、战斗指令死点击 <5%、每个等待态有可点控件。

**Architecture:** 断言写在 core。bench 复用 `benchSims`；死点击扩 `walkPlayableUi` 的 tap 指纹；等待态用 `PreviewApp` + 必要时 `startPartyBattle` 摆盘。本阶段不改伤害/等级闸、不加立绘。

**Tech Stack:** TypeScript / Vitest

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- 改完 `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 40 种子 PR 低档容差 **10–30**（宽于 200 种子的 15–25）；中/高档本阶段只要求跑完 40 种子，不通关率
- 不提交 git（除非用户要求）

---

### Task 1: 40 种子 bench 进测试

**Files:**
- Create: `packages/core/src/sim/bench.test.ts`
- Modify: `package.json`（根目录加 `test:bench`，且 `pnpm test` 仍会跑到该文件）

**Interfaces:**
- Consumes: `benchSims({ tier: "all", seeds: number, prefix?: string, maxWaves?: number }): BenchRow[]`
- Produces: Vitest 门，低档 `meanWave ∈ [10, 30]`，三档 `seeds === 40`

- [x] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { benchSims } from "./bench.ts";

describe("PR sim bench gate", () => {
  it("keeps low-tier mean wave in the 40-seed PR band", () => {
    const rows = benchSims({ tier: "all", seeds: 40, prefix: "pr-gate", maxWaves: 200 });
    expect(rows.map((row) => row.tier)).toEqual(["low", "mid", "high"]);
    for (const row of rows) {
      expect(row.seeds).toBe(40);
    }
    const low = rows.find((row) => row.tier === "low");
    expect(low?.meanWave).toBeGreaterThanOrEqual(10);
    expect(low?.meanWave).toBeLessThanOrEqual(30);
  }, 60_000);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @jingling/core exec vitest run src/sim/bench.test.ts`

Expected: FAIL because the file / assertion does not exist yet. If the file exists and already passes, the gate is already green — keep the test.

- [x] **Step 3: Wire scripts**

Root `package.json`:

```json
"test:bench": "pnpm --filter @jingling/core exec vitest run src/sim/bench.test.ts"
```

`pnpm test` 已是 core 全量 vitest，不必再串一次以免双跑。

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm test:bench`

Expected: PASS，低档均波在 10–30。

---

### Task 2: 战斗指令死点击

**Files:**
- Modify: `packages/core/src/ui/preview-app.ts`（`walkPlayableUi` 统计 dead）
- Modify: `packages/core/src/ui/preview-app.test.ts`

**Interfaces:**
- Produces: `walkPlayableUi(seed): { screens: string[]; taps: string[]; battles: number; dead: number }`

- [x] **Step 1: Write the failing test**

在 `preview-app.test.ts` 的 walk 用例中增加：

```ts
expect(report.dead / report.taps).toBeLessThan(0.05);
expect(report.taps).toEqual(expect.arrayContaining(["术", "术签", "队伍", "囊"]));
```

- [x] **Step 2: Run test to verify it fails**

Expected: FAIL on missing `dead`（或 dead 比例超标）。

- [x] **Step 3: Minimal implementation**

`walkPlayableUi` / `runUiSmoke` 的内部 `tap`：点前点后比较 `screen + log + waitingFor + wave + gold`；不变则 `dead++`。大厅烟雾里「点了必变」的控件不应计入死点击；若现有路径有真死点击，只修 walker 或该控件的 log，不改战斗公式。

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @jingling/core exec vitest run src/ui/preview-app.test.ts`

---

### Task 3: 每个等待态有控件且能推进

**Files:**
- Create: `packages/core/src/ui/quality.ts`
- Create: `packages/core/src/ui/quality.test.ts`
- Modify: `packages/core/src/index.ts` 导出 `probeWaitingUi`

**Interfaces:**
- Produces: `probeWaitingUi(seed: string): { wait: WaitKind; labels: string[]; changed: boolean }[]`
- `WaitKind = "command" | "switch" | "target" | "catch" | "shop" | "map" | "omen"`

摆盘：短征开战得 `command`；`走` 得 `catch`；`放过` 得 `shop`；`奇遇` 得 `omen`；`startPartyBattle` 双人队 + 残血得 `switch`；双敌出术得 `target`；`hasMap` + `phase=map` 得 `map`。

合法点后 `screen | waitingFor | log | hp | gold` 至少一项变化。

- [x] **Step 1: Write the failing test**（`quality.test.ts` 对每种 wait 断言 `labels.length > 0 && changed`）
- [x] **Step 2: Watch it fail**（`probeWaitingUi` 未定义）
- [x] **Step 3: Implement `probeWaitingUi`**
- [x] **Step 4: Pass**

---

### Task 4: 导出约定仍在

**Files:** `packages/core/src/creator-entry.test.ts`（已有，不改逻辑）

- [x] **Step 1:** 跑 `pnpm --filter @jingling/core exec vitest run src/creator-entry.test.ts` 必须绿
- [x] **Step 2:** 新 API 只进 `index.ts`；Cocos 未引用则不塞 `creator-entry.ts`

---

### Task 5: 验收

- [x] `pnpm test`
- [x] `pnpm check:forbidden`
- [x] `pnpm sync:core`
- [x] 勾本计划任务与路线图 Q0 说明
