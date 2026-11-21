import { describe, expect, it } from "vitest";
import { selectRunProgress } from "@jingling/core";
import { PROGRESS_ACTIONS, buildProgressModel, type ProgressKind } from "./progress.ts";

const view = selectRunProgress({
  gold: 30,
  wave: 4,
  deltas: [
    { label: "钱", before: 10, after: 30 },
    { label: "等级", before: 4, after: 5 },
  ],
  offers: [
    { id: "b1", name: "淬火", hint: "本局全队攻+2" },
    { id: "b2", name: "灵露", hint: "囊中小药+1" },
  ],
  shop: [
    { id: "s1", name: "灵露", cost: 20 },
    { id: "s2", name: "金印", cost: 80 },
    { id: "s3", name: "残卷", cost: 10, soldOut: true },
  ],
  omens: [
    { id: "o1", name: "井边低语", available: true },
    { id: "o2", name: "灶下旧约", requirement: "需要灶属伙伴", available: false },
  ],
  nodes: [
    { id: "n1", name: "废巷", reachable: true },
    { id: "n2", name: "深井", reachable: false },
    { id: "n3", name: "旧祠", reachable: true, cleared: true },
  ],
});

const empty = selectRunProgress({ gold: 0, wave: 1 });
const KINDS: ProgressKind[] = ["summary", "shop", "omen", "map"];
const STATES = ["normal", "loading", "empty", "error", "locked"] as const;

describe("run progress selector", () => {
  it("writes the shortfall for an unaffordable entry", () => {
    expect(view.shop.find((r) => r.id === "s2")?.lockedReason).toBe("还差 50 钱");
  });

  it("locks a sold out entry", () => {
    expect(view.shop.find((r) => r.id === "s3")?.lockedReason).toMatch(/卖光/);
  });

  it("keeps an affordable entry available", () => {
    expect(view.shop.find((r) => r.id === "s1")?.lockedReason).toBeNull();
  });

  it("locks an omen with an unmet requirement and says what is needed", () => {
    expect(view.omens.find((r) => r.id === "o2")?.lockedReason).toBe("需要灶属伙伴");
  });

  it("locks an unreachable node", () => {
    expect(view.nodes.find((r) => r.id === "n2")?.lockedReason).toMatch(/走不过去/);
  });

  it("carries reward deltas as before/after pairs", () => {
    expect(view.deltas[0]).toEqual({ label: "钱", before: 10, after: 30 });
  });
});

describe("run progress models", () => {
  it("always offers a safe continue path outside loading", () => {
    for (const kind of KINDS) {
      for (const state of STATES) {
        const model = buildProgressModel({
          kind,
          state,
          view: state === "empty" ? empty : view,
          reason: state === "error" || state === "locked" ? "占位原因" : undefined,
        });
        const actions = [model.primaryAction, ...model.secondaryActions];
        const enabled = actions.filter((a) => a && a.enabled);

        if (state === "loading") {
          // U2 约定：loading 为瞬时态，统一全禁用。
          expect(enabled, `${kind}/${state}`).toHaveLength(0);
        } else {
          expect(enabled.length, `${kind}/${state}`).toBeGreaterThan(0);
          expect(model.primaryAction?.enabled, `${kind}/${state}`).toBe(true);
        }
      }
    }
  });

  it("uses the page's own continue action as primary", () => {
    const ids = KINDS.map(
      (kind) => buildProgressModel({ kind, state: "normal", view }).primaryAction?.id,
    );

    expect(ids).toEqual([
      PROGRESS_ACTIONS.summaryContinue,
      PROGRESS_ACTIONS.shopLeave,
      PROGRESS_ACTIONS.omenSkip,
      PROGRESS_ACTIONS.mapRest,
    ]);
  });

  it("shows the before/after comparison on summary", () => {
    const model = buildProgressModel({ kind: "summary", state: "normal", view });

    expect(model.lines.join(" ")).toContain("10 → 30");
    expect(model.lines.join(" ")).toContain("4 → 5");
  });

  it("summary lists every offered boon as its own pick row", () => {
    const model = buildProgressModel({ kind: "summary", state: "normal", view });
    const rows = model.secondaryActions.map((a) => a.id);

    expect(rows.slice(0, 2)).toEqual([
      `${PROGRESS_ACTIONS.summaryPick}.b1`,
      `${PROGRESS_ACTIONS.summaryPick}.b2`,
    ]);
    expect(model.secondaryActions[0].label).toBe("淬火 本局全队攻+2");
  });

  it("summary offers an omen door when the run allows it", () => {
    const model = buildProgressModel({
      kind: "summary",
      state: "normal",
      view: { ...view, canOpenOmen: true },
    });

    expect(model.secondaryActions.some((a) => a.id === "omen.open")).toBe(true);
  });

  it("summary and shop offer a reroll when the cost is known", () => {
    const rich = { ...view, gold: 300, rerollCost: 250 };
    const poor = { ...view, gold: 10, rerollCost: 250 };
    const hidden = buildProgressModel({ kind: "summary", state: "normal", view });
    const paid = buildProgressModel({ kind: "summary", state: "normal", view: rich });
    const short = buildProgressModel({ kind: "summary", state: "normal", view: poor });
    const stall = buildProgressModel({ kind: "shop", state: "normal", view: rich });

    expect(hidden.secondaryActions.some((a) => a.id === PROGRESS_ACTIONS.shopReroll)).toBe(false);
    expect(paid.secondaryActions.find((a) => a.id === PROGRESS_ACTIONS.shopReroll)?.label).toBe("再择 250 钱");
    expect(paid.secondaryActions.find((a) => a.id === PROGRESS_ACTIONS.shopReroll)?.enabled).toBe(true);
    expect(short.secondaryActions.find((a) => a.id === PROGRESS_ACTIONS.shopReroll)?.enabled).toBe(false);
    expect(short.secondaryActions.find((a) => a.id === PROGRESS_ACTIONS.shopReroll)?.disabledReason).toBe("还差 240 钱");
    expect(stall.secondaryActions.some((a) => a.id === PROGRESS_ACTIONS.shopReroll)).toBe(true);
  });

  it("summary also lists shop stock so the stall is on the same page", () => {
    const model = buildProgressModel({ kind: "summary", state: "normal", view });
    const rows = model.secondaryActions.map((a) => a.id);

    expect(rows).toContain(`${PROGRESS_ACTIONS.shopBuy}.s1`);
    expect(rows).toContain(`${PROGRESS_ACTIONS.shopBuy}.s2`);
    expect(model.secondaryActions.find((a) => a.id.endsWith(".s2"))?.enabled).toBe(false);
  });

  it("summary continue says it skips the reward when boons are on offer", () => {
    const withOffers = buildProgressModel({ kind: "summary", state: "normal", view });
    const without = buildProgressModel({ kind: "summary", state: "normal", view: empty });

    expect(withOffers.primaryAction?.label).toBe("不领，继续赶路");
    expect(without.primaryAction?.label).toBe("继续");
  });

  it("summary is empty when nothing changed but still continues", () => {
    const model = buildProgressModel({ kind: "summary", state: "empty", view: empty });

    expect(model.state).toBe("empty");
    expect(model.primaryAction?.enabled).toBe(true);
  });

  it("does not filter locked rows out of shop, omen or map", () => {
    expect(
      buildProgressModel({ kind: "shop", state: "normal", view }).secondaryActions,
    ).toHaveLength(3);
    expect(
      buildProgressModel({ kind: "omen", state: "normal", view }).secondaryActions,
    ).toHaveLength(2);
    expect(
      buildProgressModel({ kind: "map", state: "normal", view }).secondaryActions,
    ).toHaveLength(3);
  });

  it("repeating the same purchase action yields an identical model", () => {
    const input = { kind: "shop" as const, state: "normal" as const, view };

    expect(buildProgressModel(input)).toEqual(buildProgressModel(input));
  });

  it("rejects an unknown progress kind", () => {
    // @ts-expect-error 运行时守卫必须存在
    expect(() => buildProgressModel({ kind: "nope", state: "normal", view })).toThrow(/progress/);
  });
});
