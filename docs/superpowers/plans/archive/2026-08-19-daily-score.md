# 今日试炼战绩 Implementation Plan

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。

**Goal:** 今日试炼按 UTC 日记录最高波，统计页能读到；隔日不串。seed / 无购买已有测。

**Architecture:** 账号 `dailyScores[utcDate] = max(wave)`。败北或通关时若 `mode === "daily"` 写入。统计文案带当日战绩。

## Global Constraints

- `pnpm test`、`pnpm check:forbidden`；改 core 再 `pnpm sync:core`

### Task 1

- [x] 测试：同日只留最高波；隔日独立；daily 败北写入 `utcDateStamp`
- [x] `recordDailyScore` / `bestDailyScore`；`noteLoss`/`noteWin` 接上；统计 log 含战绩
- [x] 规格 16 勾选「今日试炼 seed / 无购买 / 战绩 / UTC 刷新」
- [x] `pnpm test`、`check:forbidden`、`sync:core`
