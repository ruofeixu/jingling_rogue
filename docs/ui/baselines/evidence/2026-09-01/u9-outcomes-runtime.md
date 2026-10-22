# U9 结局与孵化实际 Cocos 运行验证（2026-09-01）

环境：Creator 3.8.2 web-mobile 构建 + 无头 Chrome（SwiftShader），真实 Cocos 运行时。

## 1. 截图

| 文件 | 内容 |
|---|---|
| u9-defeat.png | 败局 |
| u9-victory.png | 胜局 |
| u9-hatch.png | 孵化揭晓 |
| u9-hatch-landscape.png | 孵化（横屏） |

## 2. 三页实测

| 页 | renderer | state | 提交可用 | 回厅可用 | 渲染节点 |
|---|---|---|---|---|---|
| defeat | presentation | normal | True | True | list-view |
| victory | presentation | normal | True | True | list-view |
| hatch | presentation | normal | True | True | list-view |
| landscape-hatch | presentation | normal | True | True | list-view |

## 3. 幂等（结果只记一次）

```json
{
  "before": {
    "enabled": true,
    "lines": [
      "赢了这一局",
      "波 12",
      "钱 240",
      "收服 3 只",
      "最深 第 12 波"
    ]
  },
  "after": {
    "enabled": false,
    "reason": "已经记下了，不会重复计入",
    "lines": [
      "赢了这一局",
      "波 12",
      "钱 240",
      "收服 3 只",
      "最深 第 12 波"
    ]
  },
  "linesEqual": true,
  "lobbyStillEnabled": true
}
```

committed 由 false 变 true 后：提交动作禁用并写明「已经记下了，不会重复计入」，
明细行完全不变（linesEqual=true），回厅仍可用。中断后重新投影必落到同一状态。

## 4. 跳过动画后内容一致

```json
{
  "playedActions": [
    "outcome.commit",
    "outcome.lobby",
    "outcome.skip"
  ],
  "skippedActions": [
    "outcome.commit",
    "outcome.lobby"
  ],
  "linesEqual": true,
  "lines": [
    "赢了这一局",
    "波 12",
    "钱 240",
    "孵出 灶狸"
  ]
}
```

## 5. 明细缺失与资源错误

```json
{
  "missingDetails": {
    "state": "empty",
    "lines": [
      "这一局没有留下明细，仍可记下并回厅",
      "这一局到此为止",
      "波 0",
      "钱 0"
    ],
    "lobby": true
  },
  "artError": {
    "actions": [
      "outcome.commit",
      "outcome.lobby",
      "outcome.retry-art"
    ],
    "lobby": true
  }
}
```

## 6. 25 个产品面全量核对

```json
{
  "total": 25,
  "legacy": [],
  "noModel": []
}
```

25 个产品面全部 renderer=presentation 且都能构造出 ScreenModel，无 legacy 遗留。
