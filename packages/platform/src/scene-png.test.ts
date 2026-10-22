import { describe, expect, it } from "vitest";
import { PreviewApp, buildScene, screenLayout, THEME } from "@jingling/core";
import { paintScene, renderScenePng } from "./scene-png.ts";

const ui = screenLayout(750, 1334);

function titleCanvas() {
  return paintScene(buildScene(new PreviewApp({ seed: "shot" }), ui), ui);
}

function pixel(canvas: ReturnType<typeof paintScene>, x: number, y: number): number[] {
  const data = canvas.getContext("2d").getImageData(x, y, 1, 1).data;
  return [data[0]!, data[1]!, data[2]!];
}

describe("scene png backend", () => {
  it("paints a canvas the size of the view", () => {
    const canvas = titleCanvas();
    expect([canvas.width, canvas.height]).toEqual([750, 1334]);
  });

  it("fills the sky with paper and the ground band with field", () => {
    const canvas = titleCanvas();
    expect(pixel(canvas, 4, 4)).toEqual([...THEME.paper]);
    expect(pixel(canvas, 4, 800)).toEqual([...THEME.field]);
  });

  it("tints the primary slip with the accent and the rest lighter", () => {
    const canvas = titleCanvas();
    const primary = buildScene(new PreviewApp({ seed: "shot" }), ui).find(
      (cmd) => cmd.name === "slip-新的旅途",
    );
    if (!primary || primary.kind !== "window") {
      throw new Error("no primary slip");
    }
    const px = ui.view.width / 2 + primary.x + primary.w / 2 - 10;
    const py = ui.view.height / 2 - primary.y;
    expect(pixel(canvas, Math.round(px), Math.round(py))).toEqual([...THEME.accent]);
  });

  it("writes a real png", () => {
    const png = renderScenePng(buildScene(new PreviewApp({ seed: "shot" }), ui), ui);
    expect(png.byteLength).toBeGreaterThan(4096);
    expect([...png.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("draws ink where the title sits", () => {
    const canvas = titleCanvas();
    const band = { y: ui.view.height / 2 - (ui.lobby.splashY + 36), x0: 260, x1: 490 };
    let inked = 0;
    for (let x = band.x0; x < band.x1; x += 1) {
      for (let dy = -24; dy <= 24; dy += 1) {
        const [r, g, b] = pixel(canvas, x, Math.round(band.y + dy));
        if (r! < 140 && g! < 140 && b! < 140) {
          inked += 1;
        }
      }
    }
    expect(inked).toBeGreaterThan(400);
  });
});
