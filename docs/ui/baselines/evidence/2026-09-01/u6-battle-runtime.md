# U6 战斗主界面实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u6-battle-no-battle.png | 无战斗（empty 态，四个命令全禁用） |
| u6-battle-active.png | 进行中（四命令可用） |
| u6-battle-locked-commands.png | 三命令锁定 + 敌方倒下 |
| u6-battle-landscape.png | 横屏战斗 |

## 2. 命令门禁与 Draw Call

| 组合 | renderer | state | 命令数 | 锁定数 | Draw Call | 渲染节点 |
|---|---|---|---:|---:|---:|---|
| no-battle | presentation | empty | 4 | 4 | 43 | battle-screen |
| active | presentation | normal | 4 | 0 | 49 | battle-screen |
| locked-commands | presentation | normal | 4 | 3 | 49 | battle-screen |
| landscape | presentation | normal | 4 | 0 | 49 | battle-screen |

命令顺序恒为 battle.art / battle.party / battle.bag / battle.flee；
锁定命令全部带文字原因；无战斗时进入 empty 并提示回大厅开局。
Draw Call 峰值 49，远低于 U10 硬门 120（U10 会在真机与平台上重新采样）。

## 3. 回退与回归

```json
{
  "fallback": {
    "renderer": "legacy",
    "model": null
  },
  "regression": {
    "title": {
      "renderer": "presentation",
      "screenId": "title"
    },
    "mode": {
      "renderer": "presentation",
      "screenId": "mode"
    },
    "starter": {
      "renderer": "presentation",
      "screenId": "starter"
    },
    "codex-list": {
      "renderer": "presentation",
      "screenId": "codex-list"
    }
  }
}
```

## 4. 原始输出

```json
{
  "no-battle": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "battle-screen"
    ],
    "state": "empty",
    "commandIds": [
      "battle.art",
      "battle.party",
      "battle.bag",
      "battle.flee"
    ],
    "lockedCount": 4,
    "lines": [
      "现在没有战斗，回大厅开一局",
      "第波0",
      "金 0",
      "敌 — Lv 0 0/0 常态",
      "我 — Lv 0 0/0 常态",
      "队伍 0"
    ],
    "drawCalls": 43,
    "orientation": "portrait"
  },
  "active": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "battle-screen"
    ],
    "state": "normal",
    "commandIds": [
      "battle.art",
      "battle.party",
      "battle.bag",
      "battle.flee"
    ],
    "lockedCount": 0,
    "lines": [
      "第波3",
      "金 1200",
      "敌 灯蛾 Lv 1 12/32 常态",
      "我 灶狸 Lv 5 40/48 常态",
      "队伍 2",
      "灯蛾 出现了。点「术」出第一张。"
    ],
    "drawCalls": 49,
    "orientation": "portrait"
  },
  "locked-commands": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "battle-screen"
    ],
    "state": "normal",
    "commandIds": [
      "battle.art",
      "battle.party",
      "battle.bag",
      "battle.flee"
    ],
    "lockedCount": 3,
    "lines": [
      "第波3",
      "金 0",
      "敌 灯蛾 Lv 1 0/32 倒下",
      "我 灶狸 Lv 5 8/48 灼",
      "队伍 1",
      "灯蛾 倒下了。"
    ],
    "drawCalls": 49,
    "orientation": "portrait"
  },
  "landscape": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "battle-screen"
    ],
    "state": "normal",
    "commandIds": [
      "battle.art",
      "battle.party",
      "battle.bag",
      "battle.flee"
    ],
    "lockedCount": 0,
    "lines": [
      "第波3",
      "金 1200",
      "敌 灯蛾 Lv 1 12/32 常态",
      "我 灶狸 Lv 5 40/48 常态",
      "队伍 2",
      "灯蛾 出现了。点「术」出第一张。"
    ],
    "drawCalls": 49,
    "orientation": "landscape"
  },
  "fallbackAndRegression": {
    "fallback": {
      "renderer": "legacy",
      "model": null
    },
    "regression": {
      "title": {
        "renderer": "presentation",
        "screenId": "title"
      },
      "mode": {
        "renderer": "presentation",
        "screenId": "mode"
      },
      "starter": {
        "renderer": "presentation",
        "screenId": "starter"
      },
      "codex-list": {
        "renderer": "presentation",
        "screenId": "codex-list"
      }
    }
  }
}
```
