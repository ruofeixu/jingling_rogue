# U3 标题与模式页实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。
同一份 TitleScreen / ModeScreen 已随微信平台构建打包。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u3-title-portrait.png | 竖屏标题页（presentation renderer） |
| u3-title-landscape.png | 横屏标题页 |
| u3-mode-portrait.png | 竖屏模式选择页 |
| u3-mode-landscape.png | 横屏模式选择页 |

## 2. 路由与模型实测

| 组合 | renderer | screenId | state | 主行动 | 次级数 | 渲染节点 | 宿主 |
|---|---|---|---|---|---:|---|---|
| portrait-title | presentation | title | normal | title.start-run | 7 | title-screen | shell-host-presentation |
| portrait-mode | presentation | mode | normal | mode.select.sprint | 5 | mode-screen | shell-host-presentation |
| landscape-title | presentation | title | normal | title.start-run | 7 | title-screen | shell-host-presentation |
| landscape-mode | presentation | mode | normal | mode.select.sprint | 5 | mode-screen | shell-host-presentation |

要点：标题页恰好一个一级行动 title.start-run 加 7 个次级入口；模式页一级行动 mode.select.sprint 加 5 项；
竖横屏都能渲染；任一组合下宿主节点恰好一个。

## 3. 回退实测

逐页回退（把 title 切回 legacy 再切回来）：

```json
{
  "after": {
    "renderer": "legacy",
    "hosts": [
      "shell-host-legacy"
    ],
    "model": null
  },
  "restored": {
    "renderer": "presentation",
    "screenId": "title"
  }
}
```

全局回退（开启后即使 title 是 presentation 也走 legacy）：

```json
{
  "on": {
    "renderer": "legacy",
    "model": null
  },
  "off": {
    "renderer": "presentation",
    "model": "title"
  }
}
```

宿主从 shell-host-presentation 变为 shell-host-legacy，模型置空，说明新 renderer 被真正销毁而不是隐藏。
