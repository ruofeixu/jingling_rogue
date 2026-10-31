# PvP 设计规格（竞技场 / 天梯 / AI 天梯）

> 禁止 Phaser、上游源码、官方名。核心不得 `import "cc"`。先读 [docs/legal/clean-room.md](../../legal/clean-room.md)。
> 实施路线图：[../plans/2026-10-29-pvp-ink-roadmap.md](../plans/2026-10-29-pvp-ink-roadmap.md) 的 P1→P7。**内测路线图 B6 验收之前不开工。**

## 1. 玩法

| 模式 | 对手 | 队伍来源 | 结算 |
|------|------|----------|------|
| 竞技场 | 真人实时；匹配 30 秒超时则 AI | 轮抽：每轮 3 选 1 精怪，再 3 选 1 术法 | 3 负或 12 胜结束，按胜场计战绩 |
| 天梯 | 真人实时；匹配 30 秒超时则 AI | 账号名册（肉鸽局结束时收录） | Elo，K=32 起步 |
| AI 天梯 | 其他玩家存下的名册队伍，AI 操作 | 账号名册 | 本地打完，上传指令序列，服务器复算 |

- 同时出招：每回合双方各提交一条指令，服务器收齐后一起结算。回合计时 30 秒，超时由 AI 代选。
- 掉线：保留座位 60 秒，期间 AI 代打；重连后下发当前状态快照。
- PvP 不允许：镇物、逃跑、药、Boss、显圣/巨灵/灵极等形态切换。

## 2. 现状缺口（2026-10-29 探查）

- `combat/party-battle.ts` 是玩家对 AI 的不对称结构，敌方在 `resolveCommand`（:301-381）里由 `pickTrainerArt` 出招；判负和强制换人只对玩家一侧（:387-422）。状态在闭包里，不能快照。
- `combat/side.ts:53` 同速玩家先手；`:54` 用 `localeCompare` 兜底排序。
- 核心无 `Math.random` / `Date.now`；`RngStream`（`rng/rng-stream.ts`）由种子决定，但 `state` 是私有字段，不能序列化。
- 没有永久名册：等级、额外术法、佩饰、性灵只在 `RunSave`（`save/codec.ts:26-38`）里，局结束即丢。
- 培养成果在战斗里几乎不生效：`boneMod` 写死 1（`combat/effects/apply-art.ts:193`）；性灵只是字符串；佩饰只有 `meal` 生效（`combat/charm.ts:6`）；秘卷取表里第一个未学术法（`run/run-session.ts:353-361`）；麻痹能施加但没有处理。
- 联网为零：客户端只写 `sys.localStorage`；`packages/platform` 没有 request / socket；`server/app/main.py` 是内存存根，登录未调 code2session。

## 3. 战斗核心 `packages/core/src/pvp/`

**不改 `startPartyBattle`。** PvP 另写纯函数 reducer，复用底层零件。

| 文件 | 职责 |
|------|------|
| `types.ts` | `Seat = "a" \| "b"`、`TeamSpec`、`PvpRules`、`DuelCommand`（只有 art / switch / forfeit）、`TurnCommands`、`DuelState`、`DuelEvent`、`ReplayLog` |
| `normalize.ts` | `buildPvpSpirit`、`validateTeam`；服务器用它拒绝伪造队伍 |
| `duel-reducer.ts` | `startDuelState(opts)`、`stepDuel(state, cmds) → { state, events }`；不改入参，不抛异常，非法指令由 AI 代选并发 `autoPicked` |
| `duel-ai.ts` | `autoCommand(state, seat)`：以 `pickTrainerArt` 为基础，加换人 |
| `draft.ts` | 竞技场轮抽，见第 5 节 |
| `replay.ts` | `replayDuel(log)`、`hashDuel(state)`、`tablesVersion()` |

约束：

- `DuelState` 必须是纯数据，`JSON.stringify` 往返后哈希不变。`makeSpirit` 引用了表里的数组（`spirit-entity.ts:65, :71`），`buildPvpSpirit` 必须拷贝。
- `RngStream` 增加 `snapshot()` 与静态 `restore()`，只加不改，PvE 结果逐位不变。
- `side.ts` 抽出 `orderBySpeed(units, tieBreak)`；`speedOrder` 用原比较器包一层。PvP 每回合固定抽一次 RNG 决定同速先后，不用 `localeCompare`（结果依赖 ICU 版本，Node 与小游戏运行时可能不同）。
- 原样复用：`applyArt`、`tickAilments`、`clearGuard`、`applyHazards`、`applyPactSwitch`、`tickCharms`、`pickTrainerArt`。
- 给 `ArtContext` 加可选 `trace` 回调，产出带 `seat` 的细事件（能力等级、状态施加、守护格挡、替身吸收等）。PvE 不传 `trace`，`BattleEvent` 流不变。
- 核心没有命中率和暴击判定，不新增 miss / crit 事件。
- `ReplayLog` = `tablesVersion` + 规则 + 种子 + 双方队伍 + 每回合指令对。`tablesVersion` 是表 JSON 的哈希，表一改旧录像会被识别。

## 4. 名册 `packages/core/src/roster/`

- `AccountProgress` 加 `roster: RosterEntry[]`，上限 30。条目：`speciesId、level、artIds、charms、temper、bone、sourceRunSeed、enshrinedAt`。
- 存档 codec `v: 1` → `v: 2`；旧存档 `roster` 默认空数组。
- 肉鸽结算页（胜或负）可收录一只当前队伍里的精怪。
- PvP 一律按固定等级 50 计算属性，不带局内 boon 和 statBonus。

**培养成果生效**（天梯的前提）：

- 性灵：一项属性 +10%，一项 −10%。
- 骨药：每层对应属性 +2%，上限仍是 `boneCap`。
- 秘卷：改为 3 选 1。
- 麻痹：25% 无法行动，速度减半。
- 会改变 PvE 难度，必须按 [2026-08-19-playability-bar.md](./2026-08-19-playability-bar.md) 重跑 `pnpm sim:bench`，越界就调数值。

## 5. 竞技场轮抽

- 种族值总和 = `baseHp + baseAtk + baseDef + baseSpd`，240 只按四分位分 4 档。
- 每轮从当轮档位无放回抽 3 只，抽法同 `takeWeighted` / `pickBoon`（`run/run-session.ts:269-291`），流为 `RngStream(seed).child(round)`。
- 术法：没有可学表，从与该精怪同灵性的术法里出 3 选 1，外加其默认术法。
- 可选只出未进化形态，同 `firstStagePool`。

## 6. 网络与服务器

- 客户端 `packages/platform/src/net/`：`Socket`（`wx.connectSocket` / `tt.connectSocket` / 浏览器 `WebSocket`）和 `request`。`CloudSaveClient` 改用 `request`，替换占位域名 `save.example.com`。抖音最多同时 5 条 socket，对战只占 1 条。
- 对战服 `server-pvp/`：Node.js + TypeScript，直接 import `packages/core`，与客户端跑同一份战斗代码。
  - 登录：code2session 换 openid，签发会话令牌；Python 存档服务改为校验同一令牌。
  - 存储：先用 SQLite（账号、名册快照、天梯分、对局记录）。
  - 房间：服务器持有 `DuelState`，客户端只发指令。每回合结算后广播 `commandsRevealed` 与事件；客户端本地重算并核对 `turnEnd.hash`。
- 部署：腾讯云轻量服务器 + 已 ICP 备案域名 + HTTPS/WSS 证书，域名加入两平台 socket 与 request 合法域名（不能带端口）。
- 不用托管联机：腾讯 MGOBE 已于 2022-06-01 停服；抖音云 WebSocket 文档写明不适用于小游戏。

## 7. 赛季（本版不做，架构预留）

> 2026-10-30 负责人需求：后期兼容赛季制，例如每 2 个月一季，含赛季限定精怪、赛季排名重置、赛季皮肤、赛季称号奖励。**本版不实现**，但 P1–P7 的数据结构和接口必须按下面的预留来做，避免以后返工。

### 7.1 概念

- **赛季**：一段有起止时间的期间，带一份赛季配置。默认 2 个月，长度可配。
- **赛季配置**由服务器下发，客户端不写死：`{ id, startsAt, endsAt, rules, featuredSpirits, rewards, skins }`。
- **赛季外**（或第 0 季）：所有新增字段取默认值，行为等同于没有赛季。

### 7.2 本版必须预留的

| 预留 | 落在哪个阶段 | 做法 |
|------|--------------|------|
| `seasonId` 字段 | P3、P5、P7 | `PvpRules`、`ReplayLog`、对局记录、天梯分都带 `seasonId`，本版固定为 `"s0"`。排名按 `(seasonId, accountId)` 存，换季只是换 key，旧季数据留作历史，不删除 |
| 规则随季走 | P1、P3 | `ReplayLog` 已记 `tablesVersion` 和规则。赛季改规则（禁用术法、等级、队伍人数）只换 `PvpRules`，不改代码。旧季录像用旧季规则复算 |
| 精怪表可扩展 | P2、P3 | 限定精怪是新的 `SpiritRow`，加可选字段 `availability?: { seasons?: string[] }`。缺省表示常驻。`validateTeam` 和 `draft.ts` 按当季配置过滤可用物种，不硬编码物种列表 |
| 名册条目带来源季 | P2 | `RosterEntry` 加 `seasonId`。限定精怪过季后是否还能用于天梯，由当季规则的 `allowedSpirits` 决定，名册本身不删 |
| 外观与玩法分离 | I2、P6 | 皮肤只换贴图，不改属性。立绘加载走 `skinId`：`portraitTexturePath(id, style)` 扩展为可接 `skinId`，缺省用默认立绘。精怪实体里不存外观 |
| 账号奖励容器 | P2 | `AccountProgress` 加 `cosmetics: { skins: string[]; titles: string[]; equippedTitle?: string }`，codec v2 一起加，默认空。本版没有任何发放入口 |
| 时间来源 | P5 | 赛季起止只由服务器判定。core 继续不读时钟（现有约束），客户端显示的倒计时来自服务器下发的 `endsAt` |
| 资源分包 | I3 | 限定精怪立绘和皮肤以后放独立的赛季分包或远程资源，不进 `portraits` 分包，避免撑过 20 MiB 上限 |

### 7.3 本版明确不做

- 赛季配置管理后台、赛季切换任务、结算发奖。
- 限定精怪的获取途径（奖池、任务、商店）。
- 皮肤和称号的展示界面、装备界面。
- 赛季通行证类付费内容（涉及支付和平台资质，单独立项）。

### 7.4 以后上线时要补的

- 服务器定时切季：冻结上季排名、按段位发奖、开新季。
- 段位软重置：新季初始分 = 上季分向基准分回拉一部分（例如 `1000 + (旧分 − 1000) × 0.5`），具体数字上线前定。
- 发奖幂等：同一账号同一季的奖励只发一次，以 `(seasonId, accountId, rewardId)` 去重。
- 限定精怪的平衡要单独跑 `pnpm sim:bench` 和 PvP 对战统计。

## 8. 验收

- 确定性：同一 `ReplayLog` 跑两次 `hashDuel` 相同；每步 JSON 往返后哈希相同；`RngStream.restore(s.snapshot())` 续出相同序列。
- 镜像：交换 a、b 座位且硬币相同，结果镜像。
- 性质：HP 在 [0, maxHp]；灵力不为负；回合上限内结束；`stepDuel` 对任意指令不抛异常；入参不被修改。
- PvE 回归：现有 core 测试不改且全过；`speedOrder` 与重构前比较器在随机样本上一致。
- 服务器：两个脚本客户端跑完整局、超时、掉线重连；篡改的 AI 天梯指令序列被拒绝。
- 真机：微信、抖音开发者工具里两个账号实时打完一局，截图逐张人工看。
