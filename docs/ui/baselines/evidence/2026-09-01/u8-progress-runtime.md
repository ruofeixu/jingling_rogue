# U8 局内推进页实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u8-summary.png | 结算（含前后对比） |
| u8-shop.png | 货摊（含买不起与卖光） |
| u8-omen.png | 机缘（含条件不足） |
| u8-map.png | 境域图（含不可达节点） |
| u8-map-landscape.png | 境域图（横屏） |

## 2. 四页实测（normal）

| 页 | renderer | state | 主行动（安全继续路径） | 可用 | 条目行 | 禁用数 |
|---|---|---|---|---|---:|---:|
| summary | presentation | normal | summary.continue | True | 0 | 0 |
| shop | presentation | normal | shop.leave | True | 3 | 2 |
| omen | presentation | normal | omen.skip | True | 2 | 1 |
| map | presentation | normal | map.rest | True | 3 | 1 |
| landscape-map | presentation | normal | map.rest | True | 3 | 1 |

## 3. 空态下的安全继续路径

```json
{
  "summary": {
    "state": "empty",
    "primary": "summary.continue",
    "primaryEnabled": true,
    "hint": [
      "这一轮没有变化，可以直接继续",
      "波 0",
      "钱 0"
    ]
  },
  "shop": {
    "state": "empty",
    "primary": "shop.leave",
    "primaryEnabled": true,
    "hint": [
      "摊子上空了，离开继续赶路",
      "波 0",
      "钱 0"
    ]
  },
  "omen": {
    "state": "empty",
    "primary": "omen.skip",
    "primaryEnabled": true,
    "hint": [
      "这里没有机缘，继续赶路",
      "波 0",
      "钱 0"
    ]
  },
  "map": {
    "state": "empty",
    "primary": "map.rest",
    "primaryEnabled": true,
    "hint": [
      "没有能走的去处，先原地歇脚",
      "波 0",
      "钱 0"
    ]
  }
}
```

四页在 empty 下主行动均 enabled，且带明确的下一步文案，玩家不会被卡住。
loading 为瞬时态，按 U2 状态层约定统一全禁用（模型层测试覆盖 4 页 x 5 态共 20 组合）。

## 4. 回归

```json
{
  "battle": {
    "renderer": "presentation",
    "screenId": "battle"
  },
  "arts": {
    "renderer": "presentation",
    "screenId": "arts"
  },
  "target": {
    "renderer": "presentation",
    "screenId": "target"
  },
  "title": {
    "renderer": "presentation",
    "screenId": "title"
  },
  "starter": {
    "renderer": "presentation",
    "screenId": "starter"
  }
}
```
