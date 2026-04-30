import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  COMMUNITY_KEY,
  ERRORS_KEY,
  EXPRESSIONS_KEY,
  GOALS_KEY,
  HISTORY_KEY,
  clearAppStorage,
  loadCollection,
  loadObject,
  saveCollection,
  saveObject,
  saveUniqueItem
} from "./storage.js";

class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

describe("storage utilities", () => {
  beforeEach(() => {
    global.window = {
      localStorage: new LocalStorageMock()
    };
    global.crypto = {
      randomUUID: vi.fn(() => "test-uuid")
    };
    vi.setSystemTime(new Date("2026-04-30T08:00:00.000Z"));
  });

  it("loads and saves array collections", () => {
    saveCollection(HISTORY_KEY, [{ id: "history-1" }]);

    expect(loadCollection(HISTORY_KEY)).toEqual([{ id: "history-1" }]);
    expect(loadCollection("missing", [{ id: "fallback" }])).toEqual([{ id: "fallback" }]);
  });

  it("falls back when collection json is invalid or not an array", () => {
    window.localStorage.setItem(HISTORY_KEY, "{bad json");
    expect(loadCollection(HISTORY_KEY, [{ id: "fallback" }])).toEqual([{ id: "fallback" }]);

    window.localStorage.setItem(HISTORY_KEY, JSON.stringify({ id: "not-array" }));
    expect(loadCollection(HISTORY_KEY, [])).toEqual([]);
  });

  it("loads and saves plain objects", () => {
    saveObject(GOALS_KEY, { dailyTarget: 5 });

    expect(loadObject(GOALS_KEY)).toEqual({ dailyTarget: 5 });
    expect(loadObject("missing", { dailyTarget: 3 })).toEqual({ dailyTarget: 3 });
  });

  it("falls back when object json is invalid or not a plain object", () => {
    window.localStorage.setItem(GOALS_KEY, "{bad json");
    expect(loadObject(GOALS_KEY, { dailyTarget: 3 })).toEqual({ dailyTarget: 3 });

    window.localStorage.setItem(GOALS_KEY, JSON.stringify(["not-object"]));
    expect(loadObject(GOALS_KEY, { dailyTarget: 3 })).toEqual({ dailyTarget: 3 });
  });

  it("clears only app storage keys", () => {
    [HISTORY_KEY, EXPRESSIONS_KEY, ERRORS_KEY, GOALS_KEY, COMMUNITY_KEY].forEach((key) => {
      window.localStorage.setItem(key, "value");
    });
    window.localStorage.setItem("unrelated", "keep");

    clearAppStorage();

    expect(window.localStorage.getItem(HISTORY_KEY)).toBeNull();
    expect(window.localStorage.getItem(EXPRESSIONS_KEY)).toBeNull();
    expect(window.localStorage.getItem(ERRORS_KEY)).toBeNull();
    expect(window.localStorage.getItem(GOALS_KEY)).toBeNull();
    expect(window.localStorage.getItem(COMMUNITY_KEY)).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep");
  });

  it("saves unique non-empty learning items", () => {
    const first = saveUniqueItem([], "  useful expression  ", "测试来源");

    expect(first).toEqual([
      {
        id: "test-uuid",
        text: "useful expression",
        source: "测试来源",
        createdAt: "2026-04-30T08:00:00.000Z"
      }
    ]);

    expect(saveUniqueItem(first, "useful expression", "测试来源")).toBe(first);
    expect(saveUniqueItem(first, "   ", "测试来源")).toBe(first);
  });
});
