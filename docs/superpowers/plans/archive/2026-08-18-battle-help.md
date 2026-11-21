# 战斗反馈与名词问号 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** 术法可见说明与短动画；菜单「？」解释名词。

**Architecture:** 文案与名词表放 core 单测；Cocos 只负责 tween、飘字和问号面板。

**Tech Stack:** TypeScript / Vitest / Cocos tween

## Global Constraints

- `docs/legal/clean-room.md`、`docs/ip/spirit-bible.md` 名词
- 禁止 Phaser、上游源码、官方名
- 核心不得 `import "cc"`；`pnpm test && pnpm check:forbidden && pnpm sync:core`

---

### Task 1: 文案

- [x] copy.ts：formatArtHint / formatArtPlay / GLOSSARY 测试与实现

### Task 2: 界面

- [x] 术签效果、出手 tween、飘字、击倒稍顿、「？」名词表
- [x] `pnpm test && pnpm check:forbidden && pnpm sync:core && pnpm check:pack`
