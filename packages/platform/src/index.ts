export type PlatformId = "wx" | "tt" | "browser";

export interface LoginResult {
  code: string;
}

export interface Platform {
  readonly id: PlatformId;
  login(): Promise<LoginResult>;
  getStorage(key: string): Promise<string | null>;
  setStorage(key: string, value: string): Promise<void>;
  share(title: string): Promise<void>;
}

export interface MiniRuntime {
  login: (opts: { success: (res: { code: string }) => void }) => void;
  getStorage?: (opts: {
    key: string;
    success: (res: { data: string }) => void;
    fail: () => void;
  }) => void;
  setStorage?: (opts: { key: string; data: string; success?: () => void }) => void;
  shareAppMessage?: (opts: { title: string }) => void;
}

export interface PlatformGlobals {
  wx?: MiniRuntime;
  tt?: MiniRuntime;
}

export function createMemoryPlatform(
  id: PlatformId = "browser",
  store: Map<string, string> = new Map(),
): Platform {
  return {
    id,
    async login() {
      return { code: `${id}-local-${store.size + 1}` };
    },
    async getStorage(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    async setStorage(key: string, value: string) {
      store.set(key, value);
    },
    async share() {
      return;
    },
  };
}

function wrapMini(id: PlatformId, runtime: MiniRuntime): Platform {
  return {
    id,
    login() {
      return new Promise((resolve) => {
        runtime.login({ success: (res) => resolve({ code: res.code }) });
      });
    },
    getStorage(key: string) {
      return new Promise((resolve) => {
        if (!runtime.getStorage) {
          resolve(null);
          return;
        }
        runtime.getStorage({
          key,
          success: (res) => resolve(typeof res.data === "string" ? res.data : null),
          fail: () => resolve(null),
        });
      });
    },
    setStorage(key: string, value: string) {
      return new Promise((resolve) => {
        if (!runtime.setStorage) {
          resolve();
          return;
        }
        runtime.setStorage({ key, data: value, success: () => resolve() });
        resolve();
      });
    },
    async share(title: string) {
      runtime.shareAppMessage?.({ title });
    },
  };
}

export function createPlatform(globals: PlatformGlobals = {}): Platform {
  if (globals.wx?.login) {
    return wrapMini("wx", globals.wx);
  }
  if (globals.tt?.login) {
    return wrapMini("tt", globals.tt);
  }
  return createMemoryPlatform("browser");
}

export {
  CDN_ORIGIN,
  CloudSaveClient,
  CloudSaveError,
  SAVE_ORIGIN,
  loginCloud,
  resolveConflict,
  syncAccount,
} from "./cloud-save.ts";
export type { ConflictPick, SaveEnvelope } from "./cloud-save.ts";
export { assemblePreviewPacks } from "./preview-pack.ts";

