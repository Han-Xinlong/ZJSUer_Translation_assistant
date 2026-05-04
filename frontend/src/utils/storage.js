export const HISTORY_KEY = "zjsuer.translation.history";
export const EXPRESSIONS_KEY = "zjsuer.translation.expressions";
export const ERRORS_KEY = "zjsuer.translation.errors";
export const GOALS_KEY = "zjsuer.translation.goals";
export const COMMUNITY_KEY = "zjsuer.translation.community";
export const AUTH_TOKEN_KEY = "zjsuer.translation.auth_token";

export const APP_STORAGE_KEYS = [
  HISTORY_KEY,
  EXPRESSIONS_KEY,
  ERRORS_KEY,
  GOALS_KEY,
  COMMUNITY_KEY
];

export function loadCollection(key, fallback = []) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function saveCollection(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadObject(key, fallback = {}) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function saveObject(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadText(key, fallback = "") {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function saveText(key, value) {
  window.localStorage.setItem(key, value);
}

export function clearAppStorage() {
  APP_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function createRecordId(prefix = "record") {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveUniqueItem(items, text, source, metadata = {}) {
  const normalized = text.trim();
  if (!normalized) {
    return items;
  }

  const exists = items.some((item) => item.text === normalized && item.source === source);
  if (exists) {
    return items;
  }

  return [
    {
      id: createRecordId("item"),
      text: normalized,
      source,
      ...metadata,
      createdAt: new Date().toISOString()
    },
    ...items
  ];
}
