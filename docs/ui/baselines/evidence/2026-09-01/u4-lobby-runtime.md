# U4 大厅资料与管理页实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。
八页共用 ListView / LobbyScreen 壳，数据来自 packages/core 的只读 selector。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u4-settings.png | settings（竖屏） |
| u4-codex-list.png | codex-list（竖屏） |
| u4-codex-entry.png | codex-entry（竖屏） |
| u4-eggs.png | eggs（竖屏） |
| u4-achievements.png | achievements（竖屏） |
| u4-stats.png | stats（竖屏） |
| u4-slots.png | slots（竖屏） |
| u4-glossary.png | glossary（竖屏） |
| u4-codex-list-landscape.png | 契录列表（横屏双栏） |
| u4-codex-entry-landscape.png | 契录详情（横屏） |

## 2. 八页模型实测

| 页面 | renderer | state | 主行动 | 主行动可用 | 次级数 | 其中锁定 | 渲染节点 |
|---|---|---|---|---|---:|---:|---|
| settings | presentation | normal | settings.save | True | 5 | 0 | list-view |
| codex-list | presentation | empty | codex-list.open-entry | True | 8 | 8 | list-view |
| codex-entry | presentation | locked | codex-entry.back | True | 0 | 0 | list-view |
| eggs | presentation | empty | eggs.hatch | False | 0 | 0 | list-view |
| achievements | presentation | empty | achievements.claim | True | 71 | 71 | list-view |
| stats | presentation | empty | stats.refresh | True | 0 | 0 | list-view |
| slots | presentation | empty | slots.load.0 | False | 4 | 4 | list-view |
| glossary | presentation | normal | glossary.open-term | True | 8 | 0 | list-view |
| landscape-codex-list | presentation | empty | codex-list.open-entry | True | 8 | 8 | list-view |
| landscape-codex-entry | presentation | locked | codex-entry.back | True | 0 | 0 | list-view |

空账号下 codex-list / eggs / achievements / stats / slots 自动进入 empty 态，
codex-entry 因未见过该精怪进入 locked 态并带文字原因；锁定条目全部带 disabledReason。

## 3. U3 回归与未迁移页回退

| 检查 | renderer | state | 渲染节点 |
|---|---|---|---|
| regression-title | presentation | normal | title-screen |
| regression-mode | presentation | normal | mode-screen |
| legacy-starter | legacy | - | （旧呈现，无壳层节点） |
| legacy-battle | legacy | - | （旧呈现，无壳层节点） |

## 4. 原始输出

```json
{
  "settings": {
    "route": "settings",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "settings",
    "state": "normal",
    "primary": {
      "id": "settings.save",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 5,
    "lockedSecondary": 0,
    "lines": [
      "共 5 组设置"
    ],
    "reason": null
  },
  "codex-list": {
    "route": "codex-list",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "codex-list",
    "state": "empty",
    "primary": {
      "id": "codex-list.open-entry",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 8,
    "lockedSecondary": 8,
    "lines": [
      "还没有收契。进度 0 / 240",
      "进度 0 / 240",
      "已见 0 / 240",
      "第 1 / 30 页"
    ],
    "reason": null
  },
  "codex-entry": {
    "route": "codex-entry",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "codex-entry",
    "state": "locked",
    "primary": {
      "id": "codex-entry.back",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 0,
    "lockedSecondary": 0,
    "lines": [
      "未知条目",
      "收契后显示属性与蜕变线"
    ],
    "reason": "尚未见过这只精怪"
  },
  "eggs": {
    "route": "eggs",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "eggs",
    "state": "empty",
    "primary": {
      "id": "eggs.hatch",
      "enabled": false,
      "reason": "卵槽里没有卵"
    },
    "secondaryCount": 0,
    "lockedSecondary": 0,
    "lines": [
      "卵槽是空的。孵券 1 张，可先换一颗卵。",
      "卵槽 0",
      "孵券 1"
    ],
    "reason": null
  },
  "achievements": {
    "route": "achievements",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "achievements",
    "state": "empty",
    "primary": {
      "id": "achievements.claim",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 71,
    "lockedSecondary": 71,
    "lines": [
      "还没有成就。进度 0 / 44，通关与收契后会出现。",
      "进度 0 / 44"
    ],
    "reason": null
  },
  "stats": {
    "route": "stats",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "stats",
    "state": "empty",
    "primary": {
      "id": "stats.refresh",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 0,
    "lockedSecondary": 0,
    "lines": [
      "还没有旅途记录，开局后这里会有数字。",
      "见 0",
      "收 0",
      "缎 0",
      "今日最高波 0",
      "无历史记录"
    ],
    "reason": null
  },
  "slots": {
    "route": "slots",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "slots",
    "state": "empty",
    "primary": {
      "id": "slots.load.0",
      "enabled": false,
      "reason": "这个槽还没有存档"
    },
    "secondaryCount": 4,
    "lockedSecondary": 4,
    "lines": [
      "五个槽都是空的，开局后会自动存档。",
      "占用 0 / 5"
    ],
    "reason": null
  },
  "glossary": {
    "route": "glossary",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "glossary",
    "state": "normal",
    "primary": {
      "id": "glossary.open-term",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 8,
    "lockedSecondary": 0,
    "lines": [
      "共 16 条"
    ],
    "reason": null
  },
  "landscape-codex-list": {
    "route": "codex-list",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "codex-list",
    "state": "empty",
    "primary": {
      "id": "codex-list.open-entry",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 8,
    "lockedSecondary": 8,
    "lines": [
      "还没有收契。进度 0 / 240",
      "进度 0 / 240",
      "已见 0 / 240",
      "第 1 / 30 页"
    ],
    "reason": null
  },
  "landscape-codex-entry": {
    "route": "codex-entry",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "list-view"
    ],
    "screenId": "codex-entry",
    "state": "locked",
    "primary": {
      "id": "codex-entry.back",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 0,
    "lockedSecondary": 0,
    "lines": [
      "未知条目",
      "收契后显示属性与蜕变线"
    ],
    "reason": "尚未见过这只精怪"
  },
  "regression-title": {
    "route": "title",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "title-screen"
    ],
    "screenId": "title",
    "state": "normal",
    "primary": {
      "id": "title.start-run",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 7,
    "lockedSecondary": 0,
    "lines": [
      "精怪肉鸽",
      "点「名词」看专有词。择一契灵，入世历劫。"
    ],
    "reason": null
  },
  "regression-mode": {
    "route": "mode",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "mode-screen"
    ],
    "screenId": "mode",
    "state": "normal",
    "primary": {
      "id": "mode.select.sprint",
      "enabled": true,
      "reason": null
    },
    "secondaryCount": 5,
    "lockedSecondary": 0,
    "lines": [
      "点模式开局。右上「？」有名词。"
    ],
    "reason": null
  },
  "legacy-starter": {
    "route": "starter",
    "renderer": "legacy",
    "hosts": [
      "shell-host-legacy"
    ],
    "rendered": [],
    "screenId": null,
    "state": null,
    "primary": null,
    "secondaryCount": 0,
    "lockedSecondary": 0,
    "lines": null,
    "reason": null
  },
  "legacy-battle": {
    "route": "battle",
    "renderer": "legacy",
    "hosts": [
      "shell-host-legacy"
    ],
    "rendered": [],
    "screenId": null,
    "state": null,
    "primary": null,
    "secondaryCount": 0,
    "lockedSecondary": 0,
    "lines": null,
    "reason": null
  }
}
```
