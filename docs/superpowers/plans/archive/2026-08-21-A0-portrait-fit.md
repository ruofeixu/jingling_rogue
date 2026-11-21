# A0 立绘摆正 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 选初始和战斗里精怪等比 contain；有立绘时身后不画椭圆底。不改点击热区。

**Architecture:** `portraitFit` 放 core；Cocos `attachPortraitSprite` 用拟合宽高；`paintPortrait` 有图时不画垫底。

**Tech Stack:** TypeScript / Vitest / Cocos Creator 3.8.2

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`
- 不提交 git
- 不改 `policies.ts`、不挪 `HIT_MIN` / `coverHit`

---

### Task 1: portraitFit

**Files:** `packages/core/src/ui/portrait-fit.test.ts`、`packages/core/src/ui/portrait-fit.ts`、`packages/core/src/index.ts`、`packages/core/src/creator-entry.ts`

- [x] 失败测试：正方形 512×512 放进 140×180，输出宽高相等且 ≤ 框

```ts
import { describe, expect, it } from "vitest";
import { portraitFit } from "./portrait-fit.ts";

describe("portraitFit", () => {
  it("contains a square image in a tall box without stretching", () => {
    const fitted = portraitFit(140, 180, 512, 512);
    expect(fitted.width).toBe(fitted.height);
    expect(fitted.width).toBeLessThanOrEqual(140);
    expect(fitted.height).toBeLessThanOrEqual(180);
    expect(fitted.width).toBe(140);
  });
});
```

- [x] 实现 contain：`scale = min(boxW/imgW, boxH/imgH)`
- [x] 导出并单测通过

---

### Task 2: Cocos 贴图与去底

**Files:** `assets/scripts/ui/portrait.ts`、`assets/scripts/ui/paint.ts`、`packages/core/src/creator-entry.test.ts`

- [x] 失败测试：读 `paintPortrait` 函数体不含 `ellipse`；`portrait.ts` 含 `portraitFit`
- [x] `attachPortraitSprite` 按贴图原尺寸 `portraitFit` 后再 `setContentSize`
- [x] `hasPortrait` 时不画椭圆/阴影/剪影；无图才 `drawBody`
- [x] `pnpm test`、`check:forbidden`、`sync:core`
