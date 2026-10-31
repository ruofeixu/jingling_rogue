/**
 * B3 旅程：走发货链路（resolveAction → RunController.execute → routeAfterCommand → build*Model），
 * 只按每页自己给出的可用按钮，从标题点完一局短征回到标题。
 * 壳层的瞬时 UI 状态（模式、初始、弹层选中项）按 AppShell 的同样规则在这里保留。
 */
import { describe, expect, it } from "vitest";
import { RunController, emptyAccount, resolveProductStart, type KvStore } from "@jingling/core";
import { resolveAction } from "./dispatch.ts";
import { routeAfterCommand } from "./route-after.ts";
import { buildBattleModel } from "./screens/battle.ts";
import { buildOverlayModel, type OverlayKind } from "./screens/overlays.ts";
import { buildProgressModel, type ProgressKind } from "./screens/progress.ts";
import { buildOutcomeModel } from "./screens/outcome.ts";
import type { ScreenAction, ScreenModel } from "./screen-model.ts";

const OVERLAYS: readonly string[] = ["arts", "switch", "party", "bag", "target", "catch"];
const PROGRESS: readonly string[] = ["summary", "shop", "omen", "map"];
const PICK_VERBS = [".pick.", ".throw.", ".use.", ".inspect."];

class Journey {
  readonly controller: RunController;
  route = "title";
  readonly visited = new Set<string>();
  readonly commands: string[] = [];
  private mode = "";
  private starterId = "";
  private selectedId: string | null = null;

  constructor(private readonly seed: string, store?: KvStore) {
    this.controller = new RunController(store);
  }

  model(): ScreenModel | null {
    const c = this.controller;
    if (this.route === "battle") {
      const view = c.battleView();
      return view ? buildBattleModel({ state: "normal", view }) : null;
    }
    if (OVERLAYS.includes(this.route)) {
      return buildOverlayModel({
        kind: this.route as OverlayKind,
        state: "normal",
        view: c.overlaysView(),
        selectedId: this.selectedId,
      });
    }
    if (PROGRESS.includes(this.route)) {
      return buildProgressModel({ kind: this.route as ProgressKind, state: "normal", view: c.progressView(this.route as ProgressKind) });
    }
    if (this.route === "victory" || this.route === "defeat") {
      return buildOutcomeModel({ kind: this.route, state: "normal", view: c.outcomeView(this.route) });
    }
    return null;
  }

  async clickAsync(actionId: string): Promise<void> {
    const intent = resolveAction(actionId);
    if (intent.kind === "command") {
      await this.controller.execute(intent.command, intent.payload);
      this.route = routeAfterCommand({
        command: intent.command,
        phase: this.controller.phase(),
        current: this.route,
        waitingFor: this.controller.waitingFor(),
      });
      return;
    }
    this.click(actionId);
  }

  click(actionId: string): void {
    const intent = resolveAction(actionId);
    if (intent.kind === "route") {
      this.route = intent.to;
      return;
    }
    this.commands.push(intent.command);
    if (intent.command === "select-mode") {
      this.mode = intent.payload.mode ?? "";
    }
    if (intent.command === "starter.pick") {
      this.starterId = intent.payload.id ?? "";
    }
    if (PICK_VERBS.some((verb) => actionId.includes(verb)) && !actionId.endsWith(".confirm")) {
      this.selectedId = intent.payload.id ?? null;
    }
    if (intent.command === "starter.confirm") {
      this.controller.startRun(
        resolveProductStart({
          mode: this.mode,
          starterId: this.starterId,
          seed: this.seed,
          account: emptyAccount(),
          relicSeed: this.seed,
        }),
      );
    } else {
      this.controller.execute(intent.command, intent.payload);
    }
    const next = routeAfterCommand({
      command: intent.command,
      phase: this.controller.phase(),
      current: this.route,
      waitingFor: this.controller.waitingFor(),
    });
    if (next !== this.route) {
      this.selectedId = null;
    }
    this.route = next;
  }
}

function enabled(model: ScreenModel): ScreenAction[] {
  return [model.primaryAction, ...model.secondaryActions].filter(
    (action): action is ScreenAction => action !== null && action.enabled,
  );
}

/** 玩家策略：能选就先选第一项，再按主按钮；主按钮不可用时按第一个可用的次按钮。 */
function nextAction(route: string, model: ScreenModel): string | undefined {
  const usable = enabled(model);
  const rows = usable.filter((a) => PICK_VERBS.some((verb) => a.id.includes(verb)) && !a.id.endsWith(".confirm"));
  const primary = model.primaryAction?.enabled ? model.primaryAction.id : undefined;
  if (route === "victory" || route === "defeat") {
    return primary ?? usable.find((a) => a.id === "outcome.lobby")?.id;
  }
  if (OVERLAYS.includes(route) && rows.length > 0 && !primary) {
    return rows[0].id;
  }
  if (route === "summary" && rows.length > 0) {
    return rows[0].id;
  }
  return primary ?? usable.find((a) => a.id !== "overlay.cancel")?.id ?? usable[0]?.id;
}

function play(seed: string): Journey {
  const j = new Journey(seed);
  j.click("title.start-run");
  j.click("mode.select.sprint");
  j.click("starter.pick.zao_li");
  j.click("starter.confirm");
  return continuePlay(j);
}

/** 从当前页按可用按钮一路点到回到标题，或点数用尽。 */
function continuePlay(j: Journey, until: (j: Journey) => boolean = (x) => x.route === "title"): Journey {
  for (let step = 0; step < 600 && !until(j); step += 1) {
    j.visited.add(j.route);
    const model = j.model();
    expect(model, `no model for route "${j.route}" (phase ${j.controller.phase()})`).not.toBeNull();
    const action = nextAction(j.route, model!);
    expect(action, `no enabled button on "${j.route}" (phase ${j.controller.phase()})`).toBeTruthy();
    const before = JSON.stringify([j.route, j.controller.phase(), model]);
    j.click(action!);
    const after = JSON.stringify([j.route, j.controller.phase(), j.model()]);
    expect(after, `"${action}" on "${before.slice(0, 80)}" changed nothing`).not.toBe(before);
  }
  return j;
}

describe("B3 journey: a sprint run is clickable end to end", () => {
  for (const seed of ["b3a", "b3b", "b3c"]) {
    it(`seed ${seed}: title → sprint → outcome → title using only enabled buttons`, () => {
      const j = play(seed);

      expect(j.route).toBe("title");
      expect(j.visited.has("battle")).toBe(true);
      expect(j.visited.has("arts")).toBe(true);
      expect(j.visited.has("summary")).toBe(true);
      expect(j.visited.has("victory") || j.visited.has("defeat")).toBe(true);
      expect(j.commands).toContain("summary.pick");
      expect(j.commands).toContain("outcome.commit");
    });
  }
});

function memStore(): KvStore {
  const mem = new Map<string, string>();
  return {
    get: async (key) => mem.get(key) ?? null,
    set: async (key, value) => {
      mem.set(key, value);
    },
  };
}

describe("B4 journey: quit mid-run, reopen, load the save, finish", () => {
  it("resumes from slot 1 through the slots screen and reaches an outcome", async () => {
    const store = memStore();
    const first = new Journey("b4-journey", store);
    first.click("title.start-run");
    first.click("mode.select.sprint");
    first.click("starter.pick.zao_li");
    first.click("starter.confirm");
    continuePlay(first, (j) => (j.controller.snapshot().run.wave ?? 0) >= 4 && j.route === "battle");
    const savedWave = first.controller.snapshot().run.wave;
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve();
    }

    // 关掉重开：新的 controller，同一个存储。
    const second = new Journey("b4-journey", store);
    await second.controller.boot();
    second.click("title.open-slots");
    expect(second.route).toBe("slots");
    await second.clickAsync("slots.load.0");

    expect(second.route).toBe("battle");
    expect(second.controller.snapshot().run.wave).toBe(savedWave);
    continuePlay(second);
    expect(second.route).toBe("title");
    expect(second.visited.has("victory") || second.visited.has("defeat")).toBe(true);
  });
});
