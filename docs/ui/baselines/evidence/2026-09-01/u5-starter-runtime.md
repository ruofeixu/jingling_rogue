# U5 初始选择页实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u5-starter-no-selection.png | no-selection |
| u5-starter-selected.png | selected |
| u5-starter-art-loading.png | art-loading |
| u5-starter-art-error.png | art-error |
| u5-starter-landscape.png | 横屏，已选中 |

## 2. 确认门禁与五态

| 组合 | renderer | state | 确认可用 | 禁用原因 | 候选卡 | 重试动作 |
|---|---|---|---|---|---:|---|
| no-selection | presentation | normal | False | 先点选一只初始精怪 | 3 | False |
| selected | presentation | normal | True | — | 3 | False |
| art-loading | presentation | loading | False | 正在载入 | 3 | False |
| art-error | presentation | error | False | 立绘载入失败，先重试 | 3 | True |
| landscape | presentation | normal | True | — | 3 | False |

未选中、立绘载入中、立绘失败三种情况都不能确认，且各自给出可读原因；
立绘失败时额外出现 starter.retry-art，不会重复开始旅途。

## 3. 幂等、回退与回归

```json
{
  "idempotent": {
    "equal": true,
    "hosts": [
      "shell-host-presentation"
    ]
  },
  "fallbackAndRegression": {
    "fallback": {
      "renderer": "legacy",
      "model": null
    },
    "title": {
      "renderer": "presentation",
      "screenId": "title"
    },
    "codex": {
      "renderer": "presentation",
      "screenId": "codex-list"
    }
  }
}
```

同一输入连续路由两次模型完全相等；starter 切回 legacy 后 renderer=legacy 且模型为空；
切回 presentation 后 title 与 codex-list 均无回归。

## 4. 原始输出

```json
{
  "no-selection": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "starter-screen"
    ],
    "state": "normal",
    "primary": {
      "id": "starter.confirm",
      "enabled": false,
      "reason": "先点选一只初始精怪"
    },
    "cards": [
      "starter.pick.zao_li",
      "starter.pick.jing_zhu",
      "starter.pick.tao_geng"
    ],
    "hasRetry": false,
    "lines": [
      "未选中",
      "费用 —",
      "属 —",
      "契印 牛记",
      "立绘 ready"
    ],
    "orientation": "portrait"
  },
  "selected": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "starter-screen"
    ],
    "state": "normal",
    "primary": {
      "id": "starter.confirm",
      "enabled": true,
      "reason": null
    },
    "cards": [
      "starter.pick.zao_li",
      "starter.pick.jing_zhu",
      "starter.pick.tao_geng"
    ],
    "hasRetry": false,
    "lines": [
      "选中 灶狸",
      "费用 3",
      "属 flame",
      "契印 牛记",
      "立绘 ready"
    ],
    "orientation": "portrait"
  },
  "art-loading": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "starter-screen"
    ],
    "state": "loading",
    "primary": {
      "id": "starter.confirm",
      "enabled": false,
      "reason": "正在载入"
    },
    "cards": [
      "starter.pick.zao_li",
      "starter.pick.jing_zhu",
      "starter.pick.tao_geng"
    ],
    "hasRetry": false,
    "lines": [
      "选中 灶狸",
      "费用 3",
      "属 flame",
      "契印 牛记",
      "立绘 loading"
    ],
    "orientation": "portrait"
  },
  "art-error": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "starter-screen"
    ],
    "state": "error",
    "primary": {
      "id": "starter.confirm",
      "enabled": false,
      "reason": "立绘载入失败，先重试"
    },
    "cards": [
      "starter.pick.zao_li",
      "starter.pick.jing_zhu",
      "starter.pick.tao_geng"
    ],
    "hasRetry": true,
    "lines": [
      "选中 灶狸",
      "费用 3",
      "属 flame",
      "契印 牛记",
      "立绘 error"
    ],
    "orientation": "portrait"
  },
  "landscape": {
    "renderer": "presentation",
    "hosts": [
      "shell-host-presentation"
    ],
    "rendered": [
      "starter-screen"
    ],
    "state": "normal",
    "primary": {
      "id": "starter.confirm",
      "enabled": true,
      "reason": null
    },
    "cards": [
      "starter.pick.zao_li",
      "starter.pick.jing_zhu",
      "starter.pick.tao_geng"
    ],
    "hasRetry": false,
    "lines": [
      "选中 灶狸",
      "费用 3",
      "属 flame",
      "契印 牛记",
      "立绘 ready"
    ],
    "orientation": "landscape"
  },
  "idempotent": {
    "equal": true,
    "hosts": [
      "shell-host-presentation"
    ]
  },
  "fallbackAndRegression": {
    "fallback": {
      "renderer": "legacy",
      "model": null
    },
    "title": {
      "renderer": "presentation",
      "screenId": "title"
    },
    "codex": {
      "renderer": "presentation",
      "screenId": "codex-list"
    }
  }
}
```
