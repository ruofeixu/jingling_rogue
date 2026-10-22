import type { Affinity } from "../tables/types.ts";
import type { CombatForm, SpiritEntity } from "./spirit-entity.ts";

export type { CombatForm };

export const FORM_KEY_BOON: Record<Exclude<CombatForm, "none" | "apex">, string> = {
  sanctify: "sanctify_cuff",
  colossus: "colossus_band",
};

export function formKeysFrom(run: { boonIds: string[]; hasApexBand: boolean }): Exclude<CombatForm, "none">[] {
  const keys: Exclude<CombatForm, "none">[] = [];
  if (run.boonIds.includes(FORM_KEY_BOON.sanctify)) {
    keys.push("sanctify");
  }
  if (run.boonIds.includes(FORM_KEY_BOON.colossus)) {
    keys.push("colossus");
  }
  if (run.hasApexBand || run.boonIds.includes("apex_vessel")) {
    keys.push("apex");
  }
  return keys;
}

export function enterForm(
  unit: SpiritEntity,
  form: Exclude<CombatForm, "none">,
  apexAffinity?: Affinity,
): void {
  if (unit.form !== "none") {
    revertForm(unit);
  }
  unit.formBackup = {
    atk: unit.atk,
    maxHp: unit.maxHp,
    hp: unit.hp,
    affinities: [...unit.affinities],
  };
  unit.form = form;
  unit.formTurns = form === "apex" ? 99 : 3;
  if (form === "sanctify") {
    unit.atk = Math.round(unit.atk * 1.5);
  }
  if (form === "colossus") {
    unit.maxHp *= 2;
    unit.hp *= 2;
  }
  if (form === "apex" && apexAffinity) {
    unit.affinities = [apexAffinity];
  }
}

export function tickForm(unit: SpiritEntity): void {
  if (unit.form === "none") {
    return;
  }
  unit.formTurns -= 1;
  if (unit.formTurns <= 0) {
    revertForm(unit);
  }
}

export function revertForm(unit: SpiritEntity): void {
  const backup = unit.formBackup;
  if (!backup) {
    unit.form = "none";
    unit.formTurns = 0;
    return;
  }
  const ratio = unit.maxHp > 0 ? unit.hp / unit.maxHp : 0;
  unit.atk = backup.atk;
  unit.maxHp = backup.maxHp;
  unit.affinities = backup.affinities;
  unit.hp = Math.max(1, Math.min(backup.maxHp, Math.round(backup.maxHp * ratio)));
  if (unit.hp <= 0) {
    unit.hp = 0;
  }
  unit.form = "none";
  unit.formTurns = 0;
  unit.formBackup = null;
}
