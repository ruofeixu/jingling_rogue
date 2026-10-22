import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CloudSaveClient, SAVE_ORIGIN, loginCloud, resolveConflict, syncAccount } from "./cloud-save.ts";

describe("CloudSaveClient", () => {
  it("puts and gets account with bearer token", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      if (init?.method === "PUT") {
        return new Response(JSON.stringify({ revision: 1, payload: { codex: ["zao_li"] } }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ revision: 1, payload: { codex: ["zao_li"] } }), {
        status: 200,
      });
    };
    const client = new CloudSaveClient(SAVE_ORIGIN, "tok", fetchImpl);
    const put = await client.putAccount(0, { codex: ["zao_li"] });
    expect(put.revision).toBe(1);
    const got = await client.getAccount();
    expect(got.payload.codex).toEqual(["zao_li"]);
    expect(calls[0]?.init?.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("accepts slot 4 and rejects slot 5", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ revision: 1, payload: { wave: 4 } }), { status: 200 });
    const client = new CloudSaveClient(SAVE_ORIGIN, "tok", fetchImpl);
    const saved = await client.putRun(4, 0, { wave: 4 });
    expect(saved.payload).toEqual({ wave: 4 });
    await expect(client.putRun(5, 0, { wave: 1 })).rejects.toThrow(/slot/);
  });

  it("keeps local payload using the cloud revision after 409", async () => {
    const bodies: string[] = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      if (init?.method === "PUT" && bodies.length === 0) {
        bodies.push(String(init.body));
        return new Response(JSON.stringify({ detail: "revision conflict" }), { status: 409 });
      }
      if (!init?.method || init.method === "GET") {
        return new Response(JSON.stringify({ revision: 3, payload: { gold: 1 } }), { status: 200 });
      }
      bodies.push(String(init.body));
      return new Response(JSON.stringify({ revision: 4, payload: { gold: 99 } }), { status: 200 });
    };
    const client = new CloudSaveClient(SAVE_ORIGIN, "tok", fetchImpl);
    const result = await syncAccount(client, { revision: 1, payload: { gold: 99 } }, "keepLocal");
    expect(result.revision).toBe(4);
    expect(result.payload).toEqual({ gold: 99 });
    expect(JSON.parse(bodies[1] as string)).toMatchObject({ revision: 3, payload: { gold: 99 } });
  });

  it("uses cloud payload when asked", () => {
    const picked = resolveConflict(
      { local: { gold: 9 }, cloud: { gold: 1 }, pick: "useCloud" },
    );
    expect(picked).toEqual({ gold: 1 });
  });

  it("uses the legal-domain save origin after wx login and getRun", async () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
    const domains = JSON.parse(
      readFileSync(join(root, "game/templates/legal-domains.json"), "utf8"),
    ) as { request: string[] };
    expect(domains.request).toContain(SAVE_ORIGIN);
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push(`${init?.method ?? "GET"} ${String(url)}`);
      if (String(url).endsWith("/auth/wx")) {
        return new Response(JSON.stringify({ account_id: "wx_1", session_token: "tok" }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ revision: 0, payload: { wave: 2 } }), { status: 200 });
    };
    const session = await loginCloud(SAVE_ORIGIN, "wx", "wx-code", fetchImpl);
    expect(session.token).toBe("tok");
    const client = new CloudSaveClient(SAVE_ORIGIN, session.token, fetchImpl);
    const got = await client.getRun(4);
    expect(got.payload).toEqual({ wave: 2 });
    expect(calls).toContain(`POST ${SAVE_ORIGIN}/auth/wx`);
    expect(calls).toContain(`GET ${SAVE_ORIGIN}/save/run/4`);
  });
});
