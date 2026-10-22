# U1 AppShell 实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时与真实场景图。
同一份 AppShell / DiagnosticsView 已随微信平台构建打包（assets/main/index.js 命中 AppShell、shell-host-、diagnostics-view）。
平台页面证据见同目录 wechat-*.png 与 bytedance-*.png。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u1-diagnostics-portrait.png | 竖屏诊断页，design 750x1334 |
| u1-diagnostics-landscape.png | 横屏诊断页，design 1334x750 |

两张图里 Boot 的产品页仍在其下方正常渲染，说明 U1 挂载壳层没有改动产品呈现。
截图时把壳层宿主提到最上层是探针行为（setSiblingIndex），不在产品代码里。

## 2. 路由、单挂载不变式、逐页与全局回退

要点：任一时刻 hosts 只有一个宿主节点；title 切到 presentation 再切回 legacy 后所有者唯一；
开启全局回退后即使 title 是 presentation 也走 legacy。

```json
{
  "portrait": {
    "label": "portrait",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "orientation": "landscape",
    "design": {
      "width": 1334,
      "height": 750
    },
    "lines": [
      "orientation: landscape",
      "design: 1334x750",
      "device: 1334x750",
      "safe: t0 b0 l0 r0",
      "content: 1334x750",
      "renderer: presentation",
      "global legacy fallback: off"
    ],
    "screenId": "diagnostics"
  },
  "titlePresentation": {
    "label": "title/presentation",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "orientation": "landscape",
    "design": {
      "width": 1334,
      "height": 750
    },
    "lines": null,
    "screenId": null
  },
  "titleLegacy": {
    "label": "title/legacy",
    "renderer": "legacy",
    "hosts": [
      "shell-host-legacy"
    ],
    "orientation": "landscape",
    "design": {
      "width": 1334,
      "height": 750
    },
    "lines": null,
    "screenId": null
  },
  "globalFallback": {
    "label": "title/global-fallback",
    "renderer": "legacy",
    "hosts": [
      "shell-host-legacy"
    ],
    "orientation": "landscape",
    "design": {
      "width": 1334,
      "height": 750
    },
    "lines": null,
    "screenId": null
  },
  "backToDiagnostics": {
    "label": "diagnostics",
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "orientation": "landscape",
    "design": {
      "width": 1334,
      "height": 750
    },
    "lines": [
      "orientation: landscape",
      "design: 1334x750",
      "device: 1334x750",
      "safe: t0 b0 l0 r0",
      "content: 1334x750",
      "renderer: presentation",
      "global legacy fallback: off"
    ],
    "screenId": "diagnostics"
  }
}
{
  "orientation": "landscape",
  "design": {
    "width": 1334,
    "height": 750
  },
  "renderer": "presentation",
  "hosts": [
    "shell-host-presentation"
  ],
  "lines": [
    "orientation: landscape",
    "design: 1334x750",
    "device: 1334x750",
    "safe: t0 b0 l0 r0",
    "content: 1334x750",
    "renderer: presentation",
    "global legacy fallback: off"
  ]
}
```

## 3. 竖屏 → 横屏 → 竖屏

要点：方向变化只更新 viewport model（design 长短边互换），screenId 与 renderer 不变，宿主仍只有一个。

```json
mounted: {"orientation":"landscape","hosts":["shell-host-presentation"]}
portrait {
 "orientation": "portrait",
 "design": {
  "width": 750,
  "height": 1334
 },
 "device": {
  "width": 750,
  "height": 1334
 },
 "content": {
  "width": 750,
  "height": 1334
 },
 "renderer": "presentation",
 "hosts": [
  "shell-host-presentation"
 ],
 "screenId": "diagnostics",
 "lines": [
  "orientation: portrait",
  "design: 750x1334",
  "device: 750x1334",
  "safe: t0 b0 l0 r0",
  "content: 750x1334",
  "renderer: presentation",
  "global legacy fallback: off"
 ]
}
landscape {
 "orientation": "landscape",
 "design": {
  "width": 1334,
  "height": 750
 },
 "device": {
  "width": 1334,
  "height": 750
 },
 "content": {
  "width": 1334,
  "height": 750
 },
 "renderer": "presentation",
 "hosts": [
  "shell-host-presentation"
 ],
 "screenId": "diagnostics",
 "lines": [
  "orientation: landscape",
  "design: 1334x750",
  "device: 1334x750",
  "safe: t0 b0 l0 r0",
  "content: 1334x750",
  "renderer: presentation",
  "global legacy fallback: off"
 ]
}
portrait-again {
 "orientation": "portrait",
 "design": {
  "width": 750,
  "height": 1334
 },
 "device": {
  "width": 750,
  "height": 1334
 },
 "content": {
  "width": 750,
  "height": 1334
 },
 "renderer": "presentation",
 "hosts": [
  "shell-host-presentation"
 ],
 "screenId": "diagnostics",
 "lines": [
  "orientation: portrait",
  "design: 750x1334",
  "device: 750x1334",
  "safe: t0 b0 l0 r0",
  "content: 750x1334",
  "renderer: presentation",
  "global legacy fallback: off"
 ]
}
```
