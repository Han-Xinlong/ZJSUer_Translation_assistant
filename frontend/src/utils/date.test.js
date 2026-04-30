import { afterEach, describe, expect, it, vi } from "vitest";

import { countTodayItems, formatDate, toDateKey } from "./date.js";

describe("date utilities", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds stable local date keys", () => {
    expect(toDateKey(new Date(2026, 3, 5))).toBe("2026-04-05");
  });

  it("formats missing dates with a readable fallback", () => {
    expect(formatDate()).toBe("时间未记录");
  });

  it("counts only items created today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 30, 10, 0, 0));

    const items = [
      { id: "today-1", createdAt: new Date(2026, 3, 30, 8, 30, 0).toISOString() },
      { id: "today-2", createdAt: new Date(2026, 3, 30, 21, 10, 0).toISOString() },
      { id: "yesterday", createdAt: new Date(2026, 3, 29, 23, 59, 0).toISOString() },
      { id: "fallback-without-date" }
    ];

    expect(countTodayItems(items)).toBe(3);
  });
});
