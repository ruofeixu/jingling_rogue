# 禁用词表

机器可读副本：[`tools/forbidden-terms.json`](../../tools/forbidden-terms.json)。

扫描范围：`packages/`、`game/`、`server/`、`tools/` 下的源码与 JSON。  
不扫描：`docs/`、`node_modules/`、`.git/`、测试夹具目录中的 `*.fixture.*`。

命中即失败。新名字必须先过本表。

## IP / 商标

- pokemon, pokémon, poke（作独立词）, pokedex, pokeball
- nintendo, game freak, gamefreak
- 宝可梦, 口袋妖怪, 神奇宝贝, 皮卡丘, 精灵球

## 引擎与上游项目

- phaser
- pokerogue, pagefault, rogueserver
- battlescene, phasemanager, moveeffectphase, globalscene

## 说明

普通英文词 `ball`、`scene`、`phase` 允许。禁用的是上列整词或连写标识符。
