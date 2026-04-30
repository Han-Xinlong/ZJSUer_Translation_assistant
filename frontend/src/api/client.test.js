import { afterEach, describe, expect, it, vi } from "vitest";

import { getStatus } from "./client.js";

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches AI service status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: "ok",
        provider: "mock",
        model: "mock",
        configured: true,
        message: "Mock provider is active. No API key is required."
      })
    }));

    await expect(getStatus()).resolves.toEqual({
      status: "ok",
      provider: "mock",
      model: "mock",
      configured: true,
      message: "Mock provider is active. No API key is required."
    });
    expect(fetch).toHaveBeenCalledWith("/api/status");
  });

  it("surfaces status request errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: "backend unavailable" })
    }));

    await expect(getStatus()).rejects.toThrow("backend unavailable");
  });
});
