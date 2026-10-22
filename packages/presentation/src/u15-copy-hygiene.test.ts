import { describe, expect, it } from "vitest";
import { buildTitleModel, TITLE_ACTIONS } from "./screens/title.ts";
import { buildModeModel } from "./screens/mode.ts";
import { buildStarterModel } from "./screens/starter.ts";
import { buildProgressModel, PROGRESS_ACTIONS } from "./screens/progress.ts";
import { buildOutcomeModel } from "./screens/outcome.ts";
import { selectRunProgress, selectOutcome } from "@jingling/core";

const titleModel = buildTitleModel({
  state: "normal",
  title: "契灵志怪",
  subtitle: "精怪肉鸽",
  hint: "择一契灵，入世历劫。",
  lockedEntries: {},
});

const modeModel = buildModeModel({
  state: "normal",
  modes: [{ id: "classic", label: "经典" }],
  hint: "选一个模式。",
});

describe("U15: no internal field leaks into visible copy", () => {
  it("title heading is the product title, not an a11y label with UI-role words", () => {
    // 展示标题不得含"标题/大厅/页/界面"等界面角色词
    expect(titleModel.accessibleName).not.toMatch(/标题大厅|大厅|界面|页$/);
    expect(titleModel.accessibleName).toBe("契灵志怪");
  });

  it("no screen puts its accessibleName verbatim inside its visible lines", () => {
    for (const model of [titleModel, modeModel]) {
      for (const line of model.lines) {
        expect(line.includes(model.accessibleName), `${model.screenId}: "${line}"`).toBe(false);
      }
    }
  });

  it("starter does not leak the internal art state into visible lines", () => {
    for (const art of ["ready", "loading", "error"] as const) {
      const model = buildStarterModel({
        state: "normal",
        view: {
          candidates: [{ id: "zao_li", name: "灶狸", cost: 3, affinities: ["火"], lockedReason: null }],
          relics: [],
          chosenRelicId: null,
        } as never,
        selectedId: null,
        art,
      });
      for (const line of model.lines) {
        expect(line.includes(art), `art=${art} line="${line}"`).toBe(false);
        expect(line.includes("立绘"), `line="${line}"`).toBe(false);
      }
    }
  });
});

describe("U15: primary action is not duplicated in the secondary list", () => {
  const progressView = selectRunProgress({
    gold: 30,
    wave: 4,
    shop: [{ id: "s1", name: "灵露", cost: 20 }],
  });

  it("shop: leave is only the primary, never also a row", () => {
    const model = buildProgressModel({ kind: "shop", state: "normal", view: progressView });
    const ids = model.secondaryActions.map((a) => a.id);

    expect(model.primaryAction?.id).toBe(PROGRESS_ACTIONS.shopLeave);
    expect(ids).not.toContain(PROGRESS_ACTIONS.shopLeave);
  });

  it("outcome: commit primary is not duplicated in secondary", () => {
    const view = selectOutcome({ won: true, wave: 12, gold: 240, details: [{ label: "收服", value: "3 只" }] });
    const model = buildOutcomeModel({ kind: "victory", state: "normal", view });
    const primaryId = model.primaryAction?.id;

    expect(model.secondaryActions.map((a) => a.id)).not.toContain(primaryId);
  });
});
