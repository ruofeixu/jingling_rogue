import { pickStartRelic } from "../meta/relics.ts";
import type { RunMode } from "./modes/types.ts";
import type { StartRunOpts } from "./run-controller.ts";
import type { AccountProgress } from "./run-session.ts";

const RUN_MODES: ReadonlySet<string> = new Set(["classic", "daily", "endless", "spliced", "challenge"]);

/** 把壳层传来的模式名收成 RunController.startRun 能吃的参数。短征是经典局加契印。 */
export function resolveProductStart(input: {
  mode: string;
  starterId: string;
  seed: string;
  account: AccountProgress;
  relicSeed: string;
}): StartRunOpts {
  const sprint = input.mode === "sprint";
  const mode = (RUN_MODES.has(input.mode) ? input.mode : "classic") as RunMode;
  return {
    seed: input.seed,
    starterId: input.starterId || "zao_li",
    mode,
    account: input.account,
    sprint,
    relicId: sprint ? pickStartRelic(input.account, "", input.relicSeed) : undefined,
  };
}
