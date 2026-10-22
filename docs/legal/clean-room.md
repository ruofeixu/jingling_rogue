# Clean-room 约束（所有 agent 强制）

本仓库是独立实现，不是 Pokerogue 或任何宝可梦作品的衍生。后续开发必须遵守本节。

## 允许

- 对照**公开玩法描述**（肉鸽层数、战后三选一、捕捉解锁初始等）设计规则
- 使用本项目原创名词：精怪、契录、灵性、术法、魂契、灵力、镇物、机缘、佩饰、天时、地脉、骨相、性灵、境域
- 独立编写 TypeScript / Python，独立设计类名与文件树

## 禁止

- clone、复制、粘贴 Pokerogue / `rogueserver` 或任何 AGPL 代码
- 「对着源码改命名」的翻译式移植
- 使用其类名或近名：`BattleScene`、`PhaseManager`、`MoveEffectPhase`、`globalScene` 等
- 引入 Phaser、Pokemon 素材、官方技能名、官方球种名
- 精怪外形做成「某只宝可梦换色/换描边」

## 本项目许可

闭源专有。不要使用 AGPL / CC-BY-NC-SA 传染协议。

## 检查

改代码后运行：

```bash
uv run --project tools python tools/check_forbidden.py
```
