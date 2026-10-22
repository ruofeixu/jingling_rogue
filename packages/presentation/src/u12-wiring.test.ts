import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RunController } from "@jingling/core";
import { resolveAction } from "./dispatch.ts";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SHELL = resolve(REPO, "assets/scripts/app/AppShell.ts");

function shellSrc(): string {
  expect(existsSync(SHELL)).toBe(true);
  return readFileSync(SHELL, "utf8");
}

describe("U12 shell wiring contract", () => {
  it("exposes a run controller injection point", () => {
    const src = shellSrc();

    expect(src).toContain("setRunController");
    expect(src).toContain("RunControllerLike");
    expect(src).toContain("runController.execute");
  });

  it("keeps the shell free of gameplay: no direct combat math or state mutation", () => {
    const src = shellSrc();

    for (const forbidden of ["openBattle", "applyBattleEnd", "ClassicSlice", "startPartyBattle", ".choose("]) {
      expect(src.includes(forbidden), forbidden).toBe(false);
    }
  });

  it("only holds a structural handle — RunControllerLike lists methods, not core imports", () => {
    const src = shellSrc();
    // 结构化接口只列方法签名，不 import RunController 类
    expect(src.includes("import { RunController")).toBe(false);
    expect(src).toMatch(/interface RunControllerLike/);
  });
});

describe("U12 dispatch → controller integration", () => {
  it("a CommandIntent sequence drives a real run through the controller", () => {
    const controller = new RunController();
    controller.startRun({ seed: "u12-int", starterId: "zao_li", mode: "classic" });

    // 壳层只会回传 action id；这里模拟 renderer 回传，经 dispatch 解析后交给 controller
    const artId = controller.overlaysView().arts[0]?.id;
    expect(artId).toBeTruthy();

    const actionId = `battle.art`;
    const intent = resolveAction(actionId);
    expect(intent.kind).toBe("command");
    if (intent.kind === "command") {
      controller.execute(intent.command, intent.payload);
    }

    // 出术后战况仍可投影，形状与 U6 selectBattle 一致
    const view = controller.battleView();
    if (view) {
      expect(view.commands.map((c) => c.id)).toEqual(["art", "party", "bag", "flee"]);
    } else {
      // 已结算：outcome 视图可用
      expect(controller.outcomeView("victory")).toBeTruthy();
    }
  });

  it("unknown commands from dispatch are ignored by the controller", () => {
    const controller = new RunController();
    controller.startRun({ seed: "u12-int2", starterId: "zao_li", mode: "classic" });

    expect(() => controller.execute("no.such.command", {})).not.toThrow();
    expect(controller.battleView()).not.toBeNull();
  });
});
