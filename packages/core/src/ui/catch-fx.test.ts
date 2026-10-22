import { describe, expect, it } from "vitest";
import { CATCH_FX, catchFxDuration, catchFxPhase } from "./catch-fx.ts";

describe("catch fx", () => {
  it("throws, wobbles, then settles to caught or broke", () => {
    expect(catchFxPhase(0, true)).toBe("throw");
    expect(catchFxPhase(CATCH_FX.throwEnd - 0.01, false)).toBe("throw");
    expect(catchFxPhase(CATCH_FX.throwEnd, true)).toBe("wobble");
    expect(catchFxPhase(CATCH_FX.wobbleEnd, true)).toBe("caught");
    expect(catchFxPhase(CATCH_FX.wobbleEnd, false)).toBe("broke");
    expect(catchFxDuration()).toBe(CATCH_FX.settleEnd);
    expect(catchFxDuration()).toBeGreaterThan(CATCH_FX.wobbleEnd);
  });
});
