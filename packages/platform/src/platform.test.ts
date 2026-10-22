import { describe, expect, it } from "vitest";
import { createMemoryPlatform, createPlatform } from "./index.ts";

describe("platform adapter", () => {
  it("round-trips storage on the memory backend", async () => {
    const platform = createMemoryPlatform();
    expect(await platform.getStorage("run")).toBeNull();
    await platform.setStorage("run", "{\"slot\":0}");
    expect(await platform.getStorage("run")).toBe("{\"slot\":0}");
  });

  it("returns a login code", async () => {
    const platform = createMemoryPlatform();
    const session = await platform.login();
    expect(session.code.length).toBeGreaterThan(4);
    expect(platform.id).toBe("browser");
  });

  it("selects browser when no mini-game globals exist", () => {
    const platform = createPlatform({});
    expect(platform.id).toBe("browser");
  });

  it("selects wx when wx.login exists", () => {
    const platform = createPlatform({
      wx: {
        login: (opts: { success: (res: { code: string }) => void }) =>
          opts.success({ code: "wx-code" }),
        getStorage: () => undefined,
        setStorage: () => undefined,
        shareAppMessage: () => undefined,
      },
    });
    expect(platform.id).toBe("wx");
  });

  it("selects tt when tt.login exists", () => {
    const platform = createPlatform({
      tt: {
        login: (opts: { success: (res: { code: string }) => void }) =>
          opts.success({ code: "tt-code" }),
        getStorage: () => undefined,
        setStorage: () => undefined,
        shareAppMessage: () => undefined,
      },
    });
    expect(platform.id).toBe("tt");
  });
});
