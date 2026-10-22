# 明亮童话志怪 UI clean-room 参考矩阵

**状态（2026-08-31）：尚未完成 JPEG 像素级审阅。** 下列 URL 均是公开访问入口，目前只完成页面级观察登记；未下载、未取色、未描摹、未叠图，也未将任何截图作为制作输入。后续像素级审阅只能记录抽象统计，必须保留日期、审阅人和原创性复核结果。

矩阵只用于提炼通用原则，不证明素材授权，也不建立“一一对应”的实现目标。来源标题保持中性；仓库产品规范不得写竞品名。

| 公开 URL | 观察维度 | 可抽象原则 | 禁止复制项 |
|---|---|---|---|
| https://rocokingdom.com/web/ja/ | 世界层次、角色中心、氛围入口 | 后续只观察远中近景如何支持世界感、角色如何成为第一视觉落点；实现必须从本项目山野聚落与原创精怪重新构图 | 品牌、角色、标识、文案、地标、色板数值、页面区块顺序与具体坐标 |
| https://www.youtube.com/watch?v=Evmhfi70fNc | 镜头节奏、角色陪伴、环境动势 | 后续只记录“大静景—角色动作—主任务反馈”的抽象节奏区间；动效曲线和分镜必须独立设计 | 角色动作、镜头路径、分镜顺序、音乐、音效、台词与逐帧时间线 |
| https://www.4gamer.net/games/640/G064053/screenshot.html?mode=thumbs&move=reverse | 图库总览、世界/战斗信息密度 | 后续按世界、生活、战斗三类统计层级与留白，不按单张截图逐块映射 | 缩略图、截图素材、角色、HUD 几何、图标、字体、颜色与识别性布局 |
| https://www.4gamer.net/games/640/G064053/20260818029/ | 文章语境、世界与角色关系 | 后续只抽象角色尺度、场景叙事和信息层级的通用关系，不能将文章配图当制作模板 | 配图、标题文案、角色设定、场景地标、内容编排与具体构图 |
| https://www.4gamer.net/games/640/G064053/SS/008.jpg<br>https://www.4gamer.net/games/640/G064053/SS/018.jpg | 战斗语境审阅目标 | 待获批准的可视方法后，只记录敌我尺度、持续 HUD 与瞬时反馈的比例区间；当前不声称已看见像素内容 | 角色、招式、HUD 轮廓、图标、镜头、特效形状、配色与坐标 |
| https://www.4gamer.net/games/640/G064053/SS/011.jpg<br>https://www.4gamer.net/games/640/G064053/SS/012.jpg<br>https://www.4gamer.net/games/640/G064053/SS/013.jpg<br>https://www.4gamer.net/games/640/G064053/SS/014.jpg<br>https://www.4gamer.net/games/640/G064053/SS/015.jpg | 世界/生活语境审阅目标 | 待获批准的可视方法后，只记录前中后景、角色占比和环境互动密度；当前不声称已看见像素内容 | 角色、建筑、植物、道具、地标、任务结构、布局、色板与截图裁片 |
| https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/engine/multi-resolution.html | 竖横屏、设计分辨率、裁切 | 将设计分辨率与设备分辨率分开；背景可 cover，关键信息由 Widget/SafeArea 保持可见；横屏采用重排而非压扁 | 文档示例图片、示例项目代码、示例尺寸的逐项照搬 |
| https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/safearea.html | 安全区、边缘控件、设备异形区域 | 背景延伸到屏幕边缘，正文与返回/确认控件约束在安全区；方向变化后重新计算 | 文档截图、示例层级名称、示例节点结构的原样复制 |
| https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html | 色彩、文字可读性、浅底面板 | 正文对比度至少 4.5:1，大字至少 3:1；先保证明度对比，再用色相表达“明亮童话志怪” | 网页视觉样式、示例配色、图表与解释文案 |
| https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | 图标、焦点、控件边界、状态 | 重要图形与相邻颜色至少 3:1；选中/锁定不能只改颜色，应叠加形状或文字 | 示例控件造型、焦点样式、图标轮廓与配色组合 |
| https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | 点击热区、间距、单手操作 | 仓库采用更严格的 `44×44` 设计像素热区；视觉图标可小于热区，危险操作与相邻动作留间距 | 网页示例布局、控件排列、示例图和测试页面代码 |
| https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html | 动效、减少动效、交互反馈 | 动效服务于因果和层级；提供减少动效，移除非必要位移/缩放，保留短促状态确认 | 示例动画曲线、时长组合、转场分镜和逐帧轨迹 |
| https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html | 色彩、HUD 状态、错误与锁定 | 灵性、增减益、错误、锁定同时使用文字/形状/图标；色彩是冗余提示而非唯一编码 | 示例色板、状态图标、图例外观与页面文案 |

## 使用门禁

1. 设计评审只能引用“观察维度”和“可抽象原则”，不得把参考截图放入资源目录或关键帧文件。
2. 每一张关键帧必须从本项目世界观、原创精怪和页面主任务出发；不能按参考逐块映射。
3. 若未来进行 JPEG 像素级审阅，先记录公开 URL、访问日期和用途；输出只允许比例区间、信息密度、对比度等统计，不保存裁片、取色板或描摹层。
4. 任何观察一旦导致可识别的角色、布局、图标或动效相似，立即废弃该方案并重新原创。
