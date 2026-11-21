# 可玩通关布局 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. 对照公开回合收集玩法的底栏结构，不读、不搬 AGPL 源码，不用官方底栏素材。

**Goal:** 预览能按公开玩法跑完一局：指挥与术法分屏，组件不再互相覆盖。

**Architecture:** core `screenLayout` 给出无重叠矩形；Cocos 底栏在「术/队伍/囊/走」与四张术签之间切换。

## Global Constraints

- 禁止 Phaser、上游源码、官方名；核心不得 `import "cc"`
- 改完 `pnpm test`、`pnpm check:forbidden`、`pnpm sync:core`

---

### Task 1: 无重叠布局常量

- [x] 测试：指挥格互不重叠、日志不压指挥、大厅 gap ≥ 按钮高
- [x] 底栏 2×2；术签占用同一格

### Task 2: 预览接线

- [x] 战斗先出四指挥，点「术」再出术签
- [x] 囊/换人按钮放在立绘下方
- [x] `pnpm test && pnpm check:forbidden && pnpm sync:core`
