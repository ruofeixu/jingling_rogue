import { describe, expect, it } from "vitest";
import { closeOverlay, emptyOverlayStack, openOverlay, topOverlay, type OverlayScreenId } from "./overlay-stack.ts";

describe("overlay stack", () => {
  it("starts empty", () => {
    const stack = emptyOverlayStack();

    expect(stack.layers).toHaveLength(0);
    expect(topOverlay(stack)).toBeNull();
    expect(Object.isFrozen(stack)).toBe(true);
  });

  it("pushes layers with the control that opened them", () => {
    let stack = emptyOverlayStack();
    stack = openOverlay(stack, { screenId: "arts", triggerActionId: "battle.art" });
    stack = openOverlay(stack, { screenId: "target", triggerActionId: "arts.pick.a1" });

    expect(stack.layers.map((l) => l.screenId)).toEqual(["arts", "target"]);
    expect(topOverlay(stack)?.triggerActionId).toBe("arts.pick.a1");
  });

  it("pops in reverse order and returns the focus target", () => {
    let stack = emptyOverlayStack();
    stack = openOverlay(stack, { screenId: "arts", triggerActionId: "battle.art" });
    stack = openOverlay(stack, { screenId: "target", triggerActionId: "arts.pick.a1" });

    const first = closeOverlay(stack);
    expect(first.focusActionId).toBe("arts.pick.a1");
    expect(first.stack.layers.map((l) => l.screenId)).toEqual(["arts"]);

    const second = closeOverlay(first.stack);
    expect(second.focusActionId).toBe("battle.art");
    expect(second.stack.layers).toHaveLength(0);
  });

  it("closing an empty stack is a no-op with no focus target", () => {
    const result = closeOverlay(emptyOverlayStack());

    expect(result.stack.layers).toHaveLength(0);
    expect(result.focusActionId).toBeNull();
  });

  it("never mutates the input stack", () => {
    const stack = emptyOverlayStack();
    const opened = openOverlay(stack, { screenId: "bag", triggerActionId: "battle.bag" });

    expect(stack.layers).toHaveLength(0);
    expect(opened.layers).toHaveLength(1);
    expect(Object.isFrozen(opened)).toBe(true);
  });

  it("rejects an unknown overlay screen", () => {
    expect(() =>
      openOverlay(emptyOverlayStack(), { screenId: "title" as OverlayScreenId, triggerActionId: "x" }),
    ).toThrow(/overlay/);
  });

  it("rejects reopening the same overlay twice in a row", () => {
    const once = openOverlay(emptyOverlayStack(), { screenId: "arts", triggerActionId: "battle.art" });

    expect(() => openOverlay(once, { screenId: "arts", triggerActionId: "battle.art" })).toThrow(
      /already open/,
    );
  });
});
