export const SAVE_ORIGIN = "https://save.example.com";
export const CDN_ORIGIN = "https://cdn.example.com";

export interface SaveEnvelope {
  revision: number;
  payload: Record<string, unknown> | null;
}

export type ConflictPick = "keepLocal" | "useCloud";

export class CloudSaveError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function resolveConflict<T>(opts: { local: T; cloud: T; pick: ConflictPick }): T {
  return opts.pick === "keepLocal" ? opts.local : opts.cloud;
}

export class CloudSaveClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  private assertSlot(slot: number): void {
    if (!Number.isInteger(slot) || slot < 0 || slot > 4) {
      throw new Error("slot must be 0-4");
    }
  }

  async getAccount(): Promise<SaveEnvelope> {
    const res = await this.fetchImpl(`${this.baseUrl}/save/account`, {
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new CloudSaveError(`get account failed: ${res.status}`, res.status);
    }
    return (await res.json()) as SaveEnvelope;
  }

  async putAccount(revision: number, payload: Record<string, unknown>): Promise<SaveEnvelope> {
    const res = await this.fetchImpl(`${this.baseUrl}/save/account`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify({ revision, payload }),
    });
    if (!res.ok) {
      throw new CloudSaveError(`put account failed: ${res.status}`, res.status);
    }
    return (await res.json()) as SaveEnvelope;
  }

  async getRun(slot: number): Promise<SaveEnvelope> {
    this.assertSlot(slot);
    const res = await this.fetchImpl(`${this.baseUrl}/save/run/${slot}`, {
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new CloudSaveError(`get run failed: ${res.status}`, res.status);
    }
    return (await res.json()) as SaveEnvelope;
  }

  async putRun(
    slot: number,
    revision: number,
    payload: Record<string, unknown>,
  ): Promise<SaveEnvelope> {
    this.assertSlot(slot);
    const res = await this.fetchImpl(`${this.baseUrl}/save/run/${slot}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify({ revision, payload }),
    });
    if (!res.ok) {
      throw new CloudSaveError(`put run failed: ${res.status}`, res.status);
    }
    return (await res.json()) as SaveEnvelope;
  }
}

export async function loginCloud(
  origin: string,
  platform: "wx" | "tt",
  code: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ accountId: string; token: string }> {
  const res = await fetchImpl(`${origin}/auth/${platform}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    throw new CloudSaveError(`login failed: ${res.status}`, res.status);
  }
  const body = (await res.json()) as { account_id: string; session_token: string };
  return { accountId: body.account_id, token: body.session_token };
}

export async function syncAccount(
  client: CloudSaveClient,
  local: { revision: number; payload: Record<string, unknown> },
  pick: ConflictPick,
): Promise<SaveEnvelope> {
  try {
    return await client.putAccount(local.revision, local.payload);
  } catch (error) {
    if (!(error instanceof CloudSaveError) || error.status !== 409) {
      throw error;
    }
    const cloud = await client.getAccount();
    if (pick === "useCloud") {
      return cloud;
    }
    return client.putAccount(cloud.revision, local.payload);
  }
}
