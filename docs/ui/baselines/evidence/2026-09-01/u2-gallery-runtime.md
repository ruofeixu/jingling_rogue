# U2 组件陈列页实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。
同一份 GalleryView / StateView / Button / Panel 已随微信平台构建打包。

## 1. 截图

| 文件 | 组合 |
|---|---|
| u2-gallery-portrait.png | 竖屏，文本 100%，正常动效 |
| u2-gallery-landscape.png | 横屏，文本 100%，正常动效 |
| u2-gallery-portrait-text200.png | 竖屏，文本 200% |
| u2-gallery-portrait-reduced-motion.png | 竖屏，减少动效 |

截图里可见：五态各一格；error / locked 显示 reason；loading 的主行动带「正在载入」禁用原因；
超长标签按 ellipsis 截断。Boot 的产品页仍在下方正常渲染，说明 U2 没有改动产品呈现。

## 2. 几何与可访问性实测

| 组合 | 方向 | design | 格数 | 列数 | 标题字号 | 主行动热区 | 宿主 |
|---|---|---|---:|---:|---:|---|---|
| portrait | portrait | 750x1334 | 5 | 1 | 28 | 514x56 | shell-host-presentation |
| landscape | landscape | 1334x750 | 5 | 2 | 28 | 447x56 | shell-host-presentation |
| portrait-text200 | portrait | 750x1334 | 5 | 1 | 56 | 514x56 | shell-host-presentation |
| portrait-reduced-motion | portrait | 750x1334 | 5 | 1 | 28 | 514x56 | shell-host-presentation |

要点：竖屏单列、横屏双列；文本 200% 时标题字号 28 → 56；主行动热区 56 ≥ 44 的最小值；
任一组合下宿主节点恰好一个，单挂载不变式成立。

## 3. 原始输出

```json
{
  "portrait": {
    "textScale": 1,
    "reduceMotion": false,
    "orientation": "portrait",
    "design": {
      "width": 750,
      "height": 1334
    },
    "cells": 5,
    "columns": 1,
    "titleFontSize": 28,
    "buttonHit": {
      "width": 514,
      "height": 56
    },
    "hosts": [
      "shell-host-presentation"
    ]
  },
  "landscape": {
    "textScale": 1,
    "reduceMotion": false,
    "orientation": "landscape",
    "design": {
      "width": 1334,
      "height": 750
    },
    "cells": 5,
    "columns": 2,
    "titleFontSize": 28,
    "buttonHit": {
      "width": 447,
      "height": 56
    },
    "hosts": [
      "shell-host-presentation"
    ]
  },
  "portrait-text200": {
    "textScale": 2,
    "reduceMotion": false,
    "orientation": "portrait",
    "design": {
      "width": 750,
      "height": 1334
    },
    "cells": 5,
    "columns": 1,
    "titleFontSize": 56,
    "buttonHit": {
      "width": 514,
      "height": 56
    },
    "hosts": [
      "shell-host-presentation"
    ]
  },
  "portrait-reduced-motion": {
    "textScale": 1,
    "reduceMotion": true,
    "orientation": "portrait",
    "design": {
      "width": 750,
      "height": 1334
    },
    "cells": 5,
    "columns": 1,
    "titleFontSize": 28,
    "buttonHit": {
      "width": 514,
      "height": 56
    },
    "hosts": [
      "shell-host-presentation"
    ]
  }
}
```
