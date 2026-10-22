# U7 战斗子界面实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。
六个弹层共用 OverlayScreen（复用 U4 列表壳），合法性来自 selector。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u7-arts.png | arts 弹层（竖屏） |
| u7-switch.png | switch 弹层（竖屏） |
| u7-party.png | party 弹层（竖屏） |
| u7-bag.png | bag 弹层（竖屏） |
| u7-target.png | target 弹层（竖屏） |
| u7-catch.png | catch 弹层（竖屏） |
| u7-target-landscape.png | 选目标弹层（横屏） |

## 2. 六弹层实测

| 弹层 | renderer | state | 条目行 | 禁用数 | 取消可用 | 渲染节点 |
|---|---|---|---:|---:|---|---|
| arts | presentation | normal | 3 | 2 | True | list-view |
| switch | presentation | normal | 3 | 2 | True | list-view |
| party | presentation | normal | 3 | 2 | True | list-view |
| bag | presentation | normal | 2 | 1 | True | list-view |
| target | presentation | normal | 3 | 2 | True | list-view |
| catch | presentation | normal | 3 | 2 | True | list-view |
| landscape-target | presentation | normal | 3 | 2 | True | list-view |

非法项（用尽的术、倒下的伙伴、倒下的敌人、缺货镇物）保留在列表里但禁用并带原因，
renderer 不做过滤；取消动作在所有情况下可用。

## 3. 弹层栈与焦点恢复

```json
{
  "depths": [
    1,
    2,
    1,
    0
  ],
  "focus": [
    "arts.pick.a1",
    "battle.art"
  ],
  "backTo": "battle"
}
```

battle → arts → target 深度 1→2；逐层关闭深度 1→0，焦点依次恢复为 arts.pick.a1 与 battle.art，
最后回到 battle 页。

## 4. 回归

```json
{
  "battle": {
    "renderer": "presentation",
    "screenId": "battle"
  },
  "title": {
    "renderer": "presentation",
    "screenId": "title"
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
```
